"use server";
import { addFile, getFiles, removeFile } from "@/actions/file";
import { getCurrentUser } from "@/actions/user";
import { log } from "@/log";
import { auth } from "@clerk/nextjs/server";
import {
  configuration,
  FileSystemStorage,
  startWebsocketServer,
  Upload,
} from "@npcs/upload";
import path from "path";

configuration.set({
  storage: new FileSystemStorage(
    path.resolve("node_modules", ".cache", "upload"),
  ),
  webSocketPort: 9999,
});

if (process.env.NEXT_PHASE !== "phase-production-build") {
  startWebsocketServer();
}

const requireAuth = async () => {
  "use server";
  const { redirectToSignIn } = auth();
  redirectToSignIn();
};

export default async function Home() {
  const user = await getCurrentUser();
  const files = await getFiles();

  log.debug(files);

  return (
    <div className="w-2/3 min-w-96">
      <Upload
        initialFiles={files}
        input={
          user
            ? undefined
            : {
                onClick: requireAuth,
              }
        }
        maxSize={1024 * 1024 * 1024}
        onComplete={addFile}
        onRemove={removeFile}
      />
    </div>
  );
}
