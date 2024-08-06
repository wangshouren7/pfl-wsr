import { filesize } from "filesize";

export function formatFileSize(value: number) {
  return filesize(value, {
    standard: "jedec",
  });
}
