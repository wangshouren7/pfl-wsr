import React from "react";

import {
  IUploadClientSideProps,
  UploadClientSide,
} from "../client/ui/upload-client-side";
import { uploadActions } from "./actions";

export interface IUploadProps extends Omit<IUploadClientSideProps, "actions"> {}

export const Upload: React.FC<IUploadProps> = (props) => {
  return <UploadClientSide actions={uploadActions} {...props} />;
};
