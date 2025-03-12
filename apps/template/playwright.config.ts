import { defineConfig } from "@playwright/test";
import config from "@pfl-wsr/configs/playwright";

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** See https://playwright.dev/docs/test-configuration. */
export default defineConfig(config);
