import { Meta, StoryFn } from "@storybook/react";

import { ESupportedProtocol } from "@client/protocol";
import { EUploadClientState } from "@client/types";
import { File } from "./file";

export default {
  component: File,
  args: {},
} as Meta<typeof File>;

export const Base: StoryFn<typeof File> = () => (
  <File
    chunkSize={100}
    concurrency={3}
    elapse={999}
    name="file.txt"
    progress={61}
    protocol={ESupportedProtocol.Http}
    state={EUploadClientState.Uploading}
  />
);
