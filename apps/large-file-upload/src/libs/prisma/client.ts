import { PrismaClient } from ".prisma/client";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createInstance> | undefined;
};

function createInstance() {
  return new PrismaClient({
    transactionOptions: {
      timeout: 20 * 1000,
    },
  });
}

export const prisma = globalForPrisma.prisma || createInstance();

// we do not need to update the prisma instance when code has been changed in development.
if (process.env.NODE_ENV === "development") globalForPrisma.prisma = prisma;
