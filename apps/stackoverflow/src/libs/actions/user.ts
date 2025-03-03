"use server";

import { prisma } from "@/prisma";
import { IUser, toast } from "@/shared";
import { auth, currentUser } from "@clerk/nextjs/server";

async function getClerkId() {
  const clerkUser = await currentUser();
  return clerkUser?.id;
}

export async function getCurrent() {
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

export const getCurrentOrRedirectSignIn = async () => {
  const user = await getCurrent();

  if (!user) {
    toast({
      title: "Not signed in",
      description: "You need to be signed in to vote ⚠️",
    });
    (await auth()).redirectToSignIn();
  }

  return user!;
};

export async function createIfNeeded() {
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
        email: clerkUser.emailAddresses[0].emailAddress ?? "",
        fullName: clerkUser.fullName ?? "",
        clerkId: clerkUser.id,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username ?? "",
      },
    });
  } catch {}
}

export async function updateReputation(
  user: Pick<IUser, "id">,
  reputation: number,
) {
  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      reputation: {
        [reputation > 0 ? "increment" : "decrement"]: Math.abs(reputation),
      },
    },
  });
}
