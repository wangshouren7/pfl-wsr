import { createLog } from "@pfl-wsr/log";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { IUploadClientActions } from "../shared/actions";
import { uploadActions } from "./actions2";
import { DEFAULTS } from "./defaults";
import { SocketServer } from "./socket";

const log = createLog("upload socket server");

const globalThis = global as unknown as {
  uploadWebsocketServer?: SocketServer<IUploadClientActions>;
};

export function startWebsocketServer() {
  if (globalThis.uploadWebsocketServer) {
    return globalThis.uploadWebsocketServer;
  }

  const hostname = "0.0.0.0";

  const httpServer = createServer();

  globalThis.uploadWebsocketServer = new SocketServer(
    new Server(httpServer, {
      maxHttpBufferSize: DEFAULTS.maxChunkSize,
      cors: {
        origin: "*",
      },
    }),
    uploadActions
  );

  httpServer
    .once("error", (err) => {
      log.error(err);
      process.exit(1);
    })
    .listen(9999, () => {
      log.log(`> Socket server is ready on http://${hostname}:${9999}`);
    })
    .on("close", () => {
      delete globalThis.uploadWebsocketServer;
    });
}
