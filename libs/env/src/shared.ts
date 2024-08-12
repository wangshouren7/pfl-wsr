import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z.string().min(1),
  },
  experimental__runtimeEnv: process.env as any,
});
