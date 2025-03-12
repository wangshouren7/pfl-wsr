"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@libs/prisma/client";
import { createLog } from "@pfl-wsr/log";

const log = createLog("user actions");

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id,
    },
  });
  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Can't find user");
  }
  return user;
}

export async function createUserIfNeeded() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });
    if (existingUser) {
      return;
    }

    await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
      },
    });
  } catch (error) {
    log.error(error);
  }
}
