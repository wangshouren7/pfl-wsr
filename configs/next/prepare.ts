// @ts-check

import { createLog } from "@npcs/log";
import dotenv from "dotenv";
import exec from "exec-sh";
import createJiti from "jiti";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const IS_DEV = process.env.NODE_ENV === "development";

const log = createLog("prepare next");

if (!process.env.__PREPARED__) {
  process.env.__PREPARED__ = "true";
  prepare();
}

function prepare() {
  if (IS_DEV) {
    processPrismaDevFlow();
  }

  loadAndCheckEnv(IS_DEV);
}

function loadAndCheckEnv(isDev: boolean) {
  const __filename = fileURLToPath(import.meta.url);
  const jiti = createJiti(__filename);

  /**
   * local env file should only exists in development environment.
   * In some other environment, such as github actions or docker, local env should extends from externals
   */
  const localEnvPath = existsSync(join(__dirname, ".env.local"))
    ? join(__dirname, ".env.local")
    : "";
  const envPath = join(__dirname, ".env");
  const devEnvPath = isDev ? join(__dirname, ".env.development") : "";

  // load from file
  dotenv.config({
    path: [localEnvPath, envPath, devEnvPath].filter(Boolean),
  });

  // check
  const { env: server } = jiti(
    "@npcs/env/server",
  ) as typeof import("@npcs/env/server");
  const { env: client } = jiti(
    "@npcs/env/client",
  ) as typeof import("@npcs/env/client");

  printEnv(server, "server");
  printEnv(client, "client");
}

function printEnv(env: Record<string, string | undefined>, side: string) {
  if (IS_DEV) {
    log.info(
      `The environment variables in ${side} side are as follows (only logs in development):`,
    );
    log.table(Object.entries(env).map(([name, value]) => ({ name, value })));
  }
}

function processPrismaDevFlow() {
  const APP_PACKAGE_JSON = JSON.parse(
    readFileSync(resolve("package.json"), "utf-8"),
  );
  const APP_NAME = APP_PACKAGE_JSON.name;

  process.env.DATABASE_URL = `postgresql://postgres:123456@localhost:5432/${APP_NAME.replace("/", "_")}`;
  const hasSeed = !!APP_PACKAGE_JSON?.prisma?.seed;
  const hasPrisma = existsSync(resolve("prisma"));

  if (hasPrisma) {
    log.info("prisma dir exists, run prisma migrate dev");
    exec(`pnpm prisma migrate dev && pnpm prisma studio -b false`);

    if (hasSeed) {
      log.info("prisma seed exists, run prisma seed");
      exec(`pnpm prisma db seed`);
    }
  }
}
