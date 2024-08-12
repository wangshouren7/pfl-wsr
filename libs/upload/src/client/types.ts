export enum EUploadClientState {
  Default = "Default",
  CalculatingHash = "CalculatingHash",
  CheckingFileExists = "CheckingFileExists",
  WaitForUpload = "WaitForUpload",
  Uploading = "Uploading",
  UploadStopped = "UploadStopped",
  Merging = "Merging",
  Finishing = "Finishing",
  UploadSuccessfully = "UploadSuccessfully",
  Error = "Error",
}

export interface IUploadChunkData {
  hash: string;
  chunk: Blob | Buffer;
  index: number;
}

export interface IUploadClientActions {
  fileExists: (hash: string) => Promise<boolean>;
  chunkExists: (hash: string, index: number) => Promise<boolean>;
  merge: (hash: string) => Promise<void>;
  uploadChunk: (formData: FormData) => Promise<void>;
  getLastExistedChunkIndex: (hash: string) => Promise<number>;
}

export interface IUploadClientJSON {
  name: string;
  size: number;
  hash: string;
}
