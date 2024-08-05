"use client";

import {
  CheckIcon,
  Cross2Icon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { log } from "@shared/log";
import { useLocalStorageState, useMap, useMemoizedFn } from "ahooks";
import { sentenceCase } from "change-case";
import { get, isNumber, uniqueId } from "lodash-es";
import { useObservable, useSubscribe } from "rcrx";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { Observable } from "rxjs";
import { IUploadClientActions, IWrapServerActions } from "../../shared/actions";
import { IUploadSetting, UploadSetting } from "./setting";

import {
  Badge,
  cn,
  Input,
  InputProps,
  Progress,
  toast,
  Toaster,
} from "@npcs/ui";
import { configuration } from "@shared/configuration";
import { useIsClient } from "@shared/next";
import { io } from "socket.io-client";
import { unwrapActions } from "../actions";
import { DEFAULTS } from "../defaults";
import { ESupportedProtocol } from "../protocol";
import { SocketClient } from "../socket";
import { IUploadClientJSON, UploadClient } from "./client";
import { formatFileSize } from "./format-file-size";
import { formatTimeBySeconds } from "./format-time";
import { mp } from "./jsx";
import { Loading } from "./loading";

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
  initialFiles?: IUploadClientJSON[];
}

export const UploadClientSide: React.FC<IUploadClientSideProps> = ({
  actions: httpActions,
  input,
  maxSize,
  onComplete,
  initialFiles,
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
  const [clientMap, clientMapActions] = useMap<string, UploadClient>();
  const [idToProtocolMap, idToProtocolMapActions] = useMap<
    string,
    ESupportedProtocol
  >();

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

  const onRemove = useMemoizedFn((id: string) => {
    clientMap.get(id)?.destroy();
    clientMapActions.remove(id);
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
        {Array.from(clientMap.keys()).map((id) => (
          <UploadSingleFile
            key={id}
            client={clientMap.get(id)!}
            onRemove={() => onRemove(id)}
            {...setting}
            protocol={idToProtocolMap.get(id)}
            onComplete={onComplete}
          />
        ))}
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
  onComplete?: (info: IUploadClientJSON) => void;
}
const UploadSingleFile = memo(function UploadSingleFile(
  props: IUploadSingleFileProps,
) {
  const { client, onRemove, protocol, onComplete } = props;
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

  useSubscribe(client.state$, (state) => {
    if (
      [
        UploadClient.EState.UploadSuccessfully,
        UploadClient.EState.FastUploaded,
      ].includes(state)
    ) {
      log.log("complete");
      onComplete?.(client.toJSON());
    }
  });

  const state = useObservable(client.state$, UploadClient.EState.Default);
  const error = useObservable(client.error$, null);

  const stateString =
    state === UploadClient.EState.Error && error
      ? get(error, "message")
      : state === UploadClient.EState.Default
        ? undefined
        : sentenceCase(UploadClient.EState[state]);

  return mp(
    props,
    <div className="flex  flex-col gap-2 px-4 py-2 hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 truncate" title={file.name}>
          {file.name}
        </div>

        <Badge className="mr-2 w-[90px] justify-center">{protocol}</Badge>
      </div>

      <div
        className="flex gap-2 overflow-hidden text-xs text-gray-500"
        title={stateString}
      >
        <UploadStateIcon state$={client.state$} />
        <div className="flex-1 truncate">{stateString}</div>
      </div>

      <div className="flex items-center gap-2">
        <RxProgress value$={client.progress$} />
        <div className="flex w-12 items-center justify-end">
          <UploadControl
            state$={client.state$}
            onPlay={onPlay}
            onRestart={onRestart}
            onStop={onStop}
          />
          <TrashIcon className="ml-2 cursor-pointer" onClick={onRemove} />
        </div>
      </div>

      <div className="flex gap-2 text-xs text-gray-400">
        <div> Concurrency {client.concurrency} </div>
        <div>, Chunk size {formatFileSize(client.chunkSize)} </div>
        <UploadingElapsed elapse$={client.poolElapse$} />
      </div>
    </div>,
  );
});

const UploadingElapsed: React.FC<{
  elapse$: UploadClient["poolElapse$"];
}> = ({ elapse$ }) => {
  const elapsed = useObservable(elapse$, 0);
  return (
    <div className={cn(elapsed === 0 && "hidden")}>
      , Uploading time {formatTimeBySeconds(elapsed / 10)}
    </div>
  );
};

const UploadStateIcon: React.FC<{
  state$: UploadClient["state$"];
}> = ({ state$ }) => {
  const state = useObservable(state$, UploadClient.EState.Default);

  switch (state) {
    case UploadClient.EState.Uploading:
    case UploadClient.EState.CheckingFileExists:
    case UploadClient.EState.CalculatingHash:
    case UploadClient.EState.Merging:
      return <Loading />;

    case UploadClient.EState.UploadSuccessfully:
    case UploadClient.EState.FastUploaded:
      return <CheckIcon color="green" />;

    case UploadClient.EState.Error:
      return <Cross2Icon color="red" />;

    default:
      return null;
  }
};

interface IUploadControlProps {
  onPlay?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  state$: UploadClient["state$"];
}
const UploadControl: React.FC<IUploadControlProps> = ({
  onPlay,
  onStop,
  onRestart,
  state$,
}) => {
  const state = useObservable(state$, UploadClient.EState.Default);

  switch (state) {
    case UploadClient.EState.WaitForUpload:
    case UploadClient.EState.UploadStopped:
      return <PlayIcon className="cursor-pointer" onClick={onPlay} />;

    case UploadClient.EState.Uploading:
      return <PauseIcon className="cursor-pointer" onClick={onStop} />;

    case UploadClient.EState.Error:
      return <ReloadIcon className="cursor-pointer" onClick={onRestart} />;

    default:
      return null;
  }
};

interface IRxProgressProps {
  value$: Observable<number>;
}
const RxProgress: React.FC<IRxProgressProps> = ({ value$ }) => {
  const value = useObservable(value$, 0);

  return <Progress className="my-2 h-1" value={value} />;
};
