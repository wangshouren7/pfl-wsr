import { createLog } from "@pfl-wsr/log";
import dotenv from "dotenv";
import exec from "exec-sh";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const IS_DEV = process.env.NODE_ENV === "development";

const log = createLog("prepare next");

if (!process.env.__PREPARED__) {
  process.env.__PREPARED__ = "true";
  prepare();
}

function prepare() {
  if (IS_DEV) {
    processPrismaDev();
  }

  loadAndCheckEnv();
}

async function loadAndCheckEnv() {
  /**
   * Local env file should only exists in development environment. In some other
   * environment, such as github actions or docker, local env should extends
   * from externals
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
  const loader = async (side: string) =>
    (await import(`@pfl-wsr/env/${side}`)).then((x: any) => x.env);

  await checkEnv("shared", loader);
  await checkEnv("server", loader);
  await checkEnv("client", loader);

  async function checkEnv(side: string, loader: (id: string) => object) {
    const env = await loader(side);
    if (IS_DEV) {
      log.info(
        `The environment variables in \`${side}\` are as follows (only logs in development):`,
      );
      log.table(Object.entries(env).map(([name, value]) => ({ name, value })));
    }
  }
}

function processPrismaDev() {
  const prismaEnabled = existsSync("prisma");
  if (!prismaEnabled) {
    return;
  }

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
