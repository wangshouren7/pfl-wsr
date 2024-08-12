import { env } from "@npcs/env/shared";
import { createLog, LogLevels } from "@npcs/log";

export const log = createLog("large-file-upload");
log.level = env.NODE_ENV === "development" ? LogLevels.debug : LogLevels.info;
