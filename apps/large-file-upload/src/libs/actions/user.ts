import { log } from "@/log";
import { prisma } from "@/prisma/client";
import { currentUser } from "@clerk/nextjs/server";

async function getClerkId() {
  try {
    const clerkUser = await currentUser();
    return clerkUser?.id;
  } catch (error) {
    log.error(error);
  }
}

export async function getCurrentUser() {
  const clerkId = await getClerkId();
  if (!clerkId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });
  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
