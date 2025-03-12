"use server";

import { log } from "@/log";
import { prisma } from "@/prisma/client";
import { IUploadClientJSON } from "@pfl-wsr/upload";
import { getCurrentUser, getCurrentUserOrThrow } from "./user";

export async function addFile(info: IUploadClientJSON) {
  log.log(info);

  const user = await getCurrentUserOrThrow();
  const existingFile = await prisma.file.findFirst({
    where: {
      name: info.name,
      hash: info.hash,
    },
  });

  if (existingFile) {
    await prisma.user.update({
      where: user,
      data: {
        files: {
          update: {
            where: {
              id: existingFile.id,
            },
            data: info,
          },
        },
      },
    });
  } else {
    await prisma.file.create({
      data: {
        ...info,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
}

export async function getFiles() {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const userWithFiles = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    include: {
      files: true,
    },
  });

  return userWithFiles?.files ?? [];
}

export async function removeFile(info: IUploadClientJSON) {
  const user = await getCurrentUserOrThrow();

  const existingFile = await prisma.file.findFirstOrThrow({
    where: {
      name: info.name,
      hash: info.hash,
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      files: {
        disconnect: existingFile,
      },
    },
  });
}
