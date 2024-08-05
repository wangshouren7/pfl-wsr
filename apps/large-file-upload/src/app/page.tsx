"use server";
import { getCurrentUser, getCurrentUserOrThrow } from "@/actions/user";
import { log } from "@/log";
import { prisma } from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import {
  configuration,
  FileSystemStorage,
  IUploadProps,
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

const onComplete: IUploadProps["onComplete"] = async (fileJSON) => {
  "use server";
  log.log(fileJSON);

  const existingFile = await prisma.file.findFirst({
    where: {
      name: fileJSON.name,
      hash: fileJSON.hash,
    },
  });

  const user = await getCurrentUserOrThrow();
  if (existingFile) {
    await prisma.user.update({
      where: user,
      data: {
        files: {
          update: {
            where: {
              id: existingFile.id,
            },
            data: fileJSON,
          },
        },
      },
    });
  } else {
    await prisma.file.create({
      data: {
        ...fileJSON,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
};

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="w-2/3 min-w-96">
      <Upload
        input={
          user
            ? undefined
            : {
                onClick: requireAuth,
              }
        }
        maxSize={1024 * 1024 * 1024}
        onComplete={onComplete}
      />
    </div>
  );
}
