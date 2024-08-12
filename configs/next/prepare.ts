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

  loadAndCheckEnv();
}

function loadAndCheckEnv() {
  /**
   * local env file should only exists in development environment.
   * In some other environment, such as github actions or docker, local env should extends from externals
   */
  const localEnvPath = existsSync(join(__dirname, ".env.local"))
    ? join(__dirname, ".env.local")
    : "";
  const envPath = join(__dirname, ".env");
  const devEnvPath = IS_DEV ? join(__dirname, ".env.development") : "";

  // load from file
  dotenv.config({
    path: [localEnvPath, envPath, devEnvPath].filter(Boolean),
  });

  // check
  const __filename = fileURLToPath(import.meta.url);
  const jiti = createJiti(__filename);
  const loader = (side: string) => jiti(`@npcs/env/${side}`).env;

  checkEnv("shared", loader);
  checkEnv("server", loader);
  checkEnv("client", loader);

  function checkEnv(side: string, loader: (id: string) => object) {
    const env = loader(side);
    if (IS_DEV) {
      log.info(
        `The environment variables in \`${side}\` are as follows (only logs in development):`,
      );
      log.table(Object.entries(env).map(([name, value]) => ({ name, value })));
    }
  }
}

function processPrismaDevFlow() {
  const APP_PACKAGE_JSON = JSON.parse(
    readFileSync(resolve("package.json"), "utf-8"),
  );
  const APP_NAME = APP_PACKAGE_JSON.name;

  process.env.DATABASE_URL = `postgresql://postgres:123456@localhost:5432/${APP_NAME.replace("/", "_")}`;
  const hasSeed = !!APP_PACKAGE_JSON?.prisma?.seed;
  exec(
    `pnpm prisma migrate dev ${hasSeed ? `&& pnpm prisma db seed` : ""} && pnpm prisma studio -b false`,
    {
      stdio: "inherit",
    },
  );
}
