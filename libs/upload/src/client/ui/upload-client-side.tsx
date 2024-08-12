"use client";

import { useLocalStorageState, useMap, useMemoizedFn, useMount } from "ahooks";
import { get, isNumber, uniqueId } from "lodash-es";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { IUploadClientActions, IWrapServerActions } from "../../shared/actions";
import { IUploadSetting, UploadSetting } from "./setting";

import { EUploadClientState, IUploadClientJSON } from "@client/types";
import { Input, InputProps, toast, Toaster } from "@npcs/ui";
import { configuration } from "@shared/configuration";
import { useIsClient } from "@shared/next";
import { io } from "socket.io-client";
import { unwrapActions } from "../actions";
import { DEFAULTS } from "../defaults";
import { ESupportedProtocol } from "../protocol";
import { SocketClient } from "../socket";
import { UploadClient } from "./client";
import { File } from "./file";
import { formatFileSize } from "./format-file-size";
import { mp } from "./jsx";

const AUTO_UPLOAD = true;

export interface IUploadClientSideProps {
  actions: IWrapServerActions<IUploadClientActions>;
  input?: Omit<
    InputProps & React.RefAttributes<HTMLInputElement>,
    "type" | "value" | "change" | "onClick"
  > & {
    /**
     * If define, execute the callback instead of opening the file explorer
     */
    onClick?: () => void;
  };
  maxSize?: number;
  onComplete?: (info: IUploadClientJSON) => void;
  onRemove?: (info: IUploadClientJSON) => void;
  initialFiles?: IUploadClientJSON[];
}

export const UploadClientSide: React.FC<IUploadClientSideProps> = ({
  actions: httpActions,
  input,
  maxSize,
  onComplete,
  initialFiles,
  onRemove: _onRemove,
}) => {
  const { isClient } = useIsClient();
  const [setting, setSetting] = useLocalStorageState<IUploadSetting>(
    "uploadSetting",
    {
      defaultValue: {
        chunkSize: DEFAULTS.chunkSize,
        concurrency: DEFAULTS.concurrency,
        protocol: DEFAULTS.protocol,
      },
    },
  );
  const [clientMap, clientMapActions] = useMap<
    string,
    UploadClient | IUploadClientJSON
  >();
  const [idToProtocolMap, idToProtocolMapActions] = useMap<
    string,
    ESupportedProtocol
  >();

  useMount(() => {
    initialFiles?.forEach((file) => {
      const id = get(file, "id") || uniqueId();
      clientMapActions.set(String(id), file);
    });
  });

  const socketClient = useMemo(
    () =>
      isClient
        ? new SocketClient<IWrapServerActions<IUploadClientActions>>(
            io(
              `${location.protocol}//${location.hostname}:${configuration.webSocketPort}`,
            ),
          )
        : null,
    [isClient],
  );
  const canUseWebsocket = !!socketClient;
  const protocol =
    setting?.protocol === ESupportedProtocol.Http || !canUseWebsocket
      ? ESupportedProtocol.Http
      : ESupportedProtocol.Websocket;

  const actions = useMemo(
    () =>
      protocol === ESupportedProtocol.Http
        ? httpActions
        : socketClient!.actions,
    [protocol, socketClient, httpActions],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainer = scrollContainerRef.current;

  const onChange = useMemoizedFn((async (e) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      if (isNumber(maxSize) && file.size > maxSize) {
        toast({
          title: `File ${file.name} is too large. Max size is ${formatFileSize(
            maxSize,
          )}`,
          variant: "destructive",
        });
        return;
      }

      const id = uniqueId();
      const client = new UploadClient(
        file,
        unwrapActions(actions),
        setting?.concurrency,
        setting?.chunkSize,
      );
      client.finisher = async () => onComplete?.(client.toJSON());
      idToProtocolMap.set(id, protocol);
      clientMap.set(id, client);
    });

    clientMapActions.setAll(clientMap);
    idToProtocolMapActions.setAll(idToProtocolMap);

    if (scrollContainer) {
      setTimeout(() => {
        (scrollContainer.lastChild as HTMLDivElement | null)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  }) satisfies React.ComponentProps<"input">["onChange"]);

  const onRemove = useMemoizedFn(async (id: string) => {
    const file = clientMap.get(id);
    if (file instanceof UploadClient) {
      await _onRemove?.(file.toJSON());
      clientMapActions.remove(id);
      file.destroy();
    } else if (file) {
      _onRemove?.(file);
      clientMapActions.remove(id);
    }
  });

  const onClick = useMemoizedFn(((e) => {
    if (input?.onClick) {
      input.onClick();
      e.preventDefault();
    }
  }) satisfies InputProps["onClick"]);

  return (
    <div className="flex flex-col gap-4 border border-solid py-4">
      <Toaster />

      <div className="mb-4 px-4">
        <UploadSetting
          disabled={!isClient}
          value={
            isClient
              ? setting
              : {
                  concurrency: 0,
                  chunkSize: 0,
                  protocol: "",
                }
          }
          onChange={setSetting}
        />
      </div>

      <div className="flex gap-4 px-4">
        <Input
          multiple
          type="file"
          value={""}
          onChange={onChange}
          {...input}
          onClick={onClick}
        />
      </div>

      <div ref={scrollContainerRef} className="h-64 overflow-auto">
        {Array.from(clientMap.keys()).map((id) => {
          const client = clientMap.get(id);

          if (client instanceof UploadClient) {
            return (
              <UploadSingleFile
                key={id}
                client={client}
                onRemove={() => onRemove(id)}
                {...setting}
                protocol={idToProtocolMap.get(id)}
              />
            );
          }

          if (client) {
            return (
              <File
                key={id}
                state={EUploadClientState.UploadSuccessfully}
                {...client}
                progress={100}
                onRemove={() => onRemove(id)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

interface IUploadSingleFileProps {
  className?: string;
  onRemove?: () => void;
  concurrency?: number;
  client: UploadClient;
  chunkSize?: number;
  protocol?: string;
}
const UploadSingleFile = memo(function UploadSingleFile(
  props: IUploadSingleFileProps,
) {
  const { client, onRemove, protocol } = props;
  const file = client.file;

  useEffect(() => {
    client.start(AUTO_UPLOAD);
  }, [client]);

  const onPlay = useMemoizedFn(() => {
    client.startPool();
  });

  const onStop = useMemoizedFn(() => {
    client.stopPool();
  });

  const onRestart = useMemoizedFn(() => {
    client.restart(AUTO_UPLOAD);
  });

  return mp(
    props,
    <File
      chunkSize={client.chunkSize}
      concurrency={client.concurrency}
      elapse={client.poolElapse$}
      name={file.name}
      progress={client.progress$}
      protocol={protocol}
      state={client.state$}
      onPlay={onPlay}
      onRemove={onRemove}
      onRestart={onRestart}
      onStop={onStop}
    />,
  );
});
