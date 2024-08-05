import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { productionBuildOptional } from "./utils";

export const env = createEnv({
  server: {
    DATABASE_URL: productionBuildOptional(z.string().min(1)),
    CLERK_SECRET_KEY: productionBuildOptional(z.string().min(1)),
    WEBHOOK_SECRET: productionBuildOptional(z.string().min(1)),
  },
  experimental__runtimeEnv: process.env,
});
