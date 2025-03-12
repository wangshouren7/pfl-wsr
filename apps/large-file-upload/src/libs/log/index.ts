import { env } from "@pfl-wsr/env/shared";
import { createLog, LogLevels } from "@pfl-wsr/log";

export const log = createLog("large-file-upload");
log.level = env.NODE_ENV === "development" ? LogLevels.debug : LogLevels.info;
