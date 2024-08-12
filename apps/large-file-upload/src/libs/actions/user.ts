"use server";

import { log } from "@/log";
import { prisma } from "@/prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { env } from "@npcs/env/shared";

async function getClerkUser() {
  try {
    return await currentUser();
  } catch (error) {
    log.error(error);
    return null;
  }
}

export async function getClerkUserId() {
  return auth().userId;
}

export async function getCurrentUser() {
  const clerkId = await getClerkUserId();
  log.debug({ clerkId });
  if (!clerkId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  log.debug({ user });

  // Enable test users in development
  if (env.NODE_ENV === "development" && !user) {
    const clerkUser = await getClerkUser();
    if (clerkUser?.emailAddresses[0]?.emailAddress.includes("+clerk_test")) {
      const user = await prisma.user.create({
        data: {
          clerkId,
        },
      });
      return user;
    }
  }

  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
