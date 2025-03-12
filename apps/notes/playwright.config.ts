import config from "@pfl-wsr/configs/playwright";
import { defineConfig } from "@playwright/test";

/** Read environment variables from file. https://github.com/motdotla/dotenv */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.development") });

/** See https://playwright.dev/docs/test-configuration. */
export default defineConfig(config);
