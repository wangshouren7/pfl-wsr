import { EUploadClientState } from "@client/types";
import { Badge, cn, IComponentBaseProps, mp, Progress } from "@npcs/ui";
import {
  CheckIcon,
  Cross2Icon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { memo } from "react";
import { formatFileSize } from "./format-file-size";
import { formatTimeBySeconds } from "./format-time";
import { Loading } from "./loading";
import { IObservableOrValue, Observer } from "./observer";

interface IUploadSingleFileProps extends IComponentBaseProps {
  name: string;
  chunkSize: number;
  state: IObservableOrValue<EUploadClientState>;
  progress: IObservableOrValue<number>;
  elapse: IObservableOrValue<number>;
  className?: string;
  onRemove?: () => void;
  concurrency: number;
  protocol: string;
  onPlay?: () => void;
  onRestart?: () => void;
  onStop?: () => void;
}

export const File = memo(function UploadSingleFile(
  props: IUploadSingleFileProps,
) {
  const {
    name,
    protocol,
    state,
    onRemove,
    progress,
    onPlay,
    onRestart,
    onStop,
    concurrency,
    chunkSize,
    elapse,
  } = props;
  return mp(
    props,
    <div className="flex  flex-col gap-2 px-4 py-2 hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 truncate" title={name}>
          {name}
        </div>

        <Badge className="mr-2 w-[90px] justify-center">{protocol}</Badge>
      </div>

      <Observer observable={state}>
        {(state) => {
          return (
            <div
              className="flex gap-2 overflow-hidden text-xs text-gray-500"
              title={EUploadClientState[state]}
            >
              <UploadStateIcon state={state} />
              <div className="flex-1 truncate">{EUploadClientState[state]}</div>
            </div>
          );
        }}
      </Observer>

      <div className="flex items-center gap-2">
        <Observer observable={progress}>
          {(progress) => <Progress className="my-2 h-1" value={progress} />}
        </Observer>
        <div className="flex w-12 items-center justify-end">
          <Observer observable={state}>
            {(state) => (
              <UploadControl
                state={state}
                onPlay={onPlay}
                onRestart={onRestart}
                onStop={onStop}
              />
            )}
          </Observer>
          <TrashIcon className="ml-2 cursor-pointer" onClick={onRemove} />
        </div>
      </div>

      <div className="flex gap-2 text-xs text-gray-400">
        <div> Concurrency {concurrency} </div>
        <div>, Chunk size {formatFileSize(chunkSize)} </div>
        <Observer observable={elapse}>
          {(elapsed) => <UploadingElapsed elapsed={elapsed} />}
        </Observer>
      </div>
    </div>,
  );
});

const UploadingElapsed: React.FC<{
  elapsed: number;
}> = ({ elapsed }) => {
  return (
    <div className={cn(elapsed === 0 && "hidden")}>
      , Uploading time {formatTimeBySeconds(elapsed / 10)}
    </div>
  );
};

const UploadStateIcon: React.FC<{
  state: EUploadClientState;
}> = ({ state }) => {
  switch (state) {
    case EUploadClientState.Uploading:
    case EUploadClientState.CheckingFileExists:
    case EUploadClientState.CalculatingHash:
    case EUploadClientState.Merging:
      return <Loading />;

    case EUploadClientState.UploadSuccessfully:
    case EUploadClientState.FastUploaded:
      return <CheckIcon color="green" />;

    case EUploadClientState.Error:
      return <Cross2Icon color="red" />;

    default:
      return null;
  }
};

interface IUploadControlProps {
  onPlay?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  state: EUploadClientState;
}
const UploadControl: React.FC<IUploadControlProps> = ({
  onPlay,
  onStop,
  onRestart,
  state,
}) => {
  switch (state) {
    case EUploadClientState.WaitForUpload:
    case EUploadClientState.UploadStopped:
      return <PlayIcon className="cursor-pointer" onClick={onPlay} />;

    case EUploadClientState.Uploading:
      return <PauseIcon className="cursor-pointer" onClick={onStop} />;

    case EUploadClientState.Error:
      return <ReloadIcon className="cursor-pointer" onClick={onRestart} />;

    default:
      return null;
  }
};

const ProgressUI: React.FC<{ progress: number }> = ({ progress }) => {
  return <Progress className="my-2 h-1" value={progress} />;
};
