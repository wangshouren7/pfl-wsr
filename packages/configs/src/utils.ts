import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const configsPath = path.resolve(__dirname, "..");

export const workspaceRoot = path.resolve(configsPath, "../../");
