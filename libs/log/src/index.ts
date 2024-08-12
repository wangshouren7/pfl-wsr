import { consola, ConsolaInstance, LogLevels } from "consola";

export interface ILog extends ConsolaInstance {
  table: (tabularData?: any, properties?: string[]) => void;
}

export function createLog(tag: string): ILog {
  const log = consola.withTag(tag) as ILog;
  log.table = (tabularData?: any, properties?: string[]) =>
    // eslint-disable-next-line no-console
    console.table(tabularData, properties);
  return log as ILog;
}

export { LogLevels };
