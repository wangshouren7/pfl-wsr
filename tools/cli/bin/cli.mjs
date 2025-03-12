#!/usr/bin/env node

// @ts-check
import { Command as Commander } from "commander";
import { consola } from "consola";
import * as commands from "../esm/index.js";
import { Command } from "../esm/index.js";

(async () => {
  process.on("SIGINT", function () {
    process.exit();
  });

  const log = consola.withTag("@npcs/cli");

  /** @param {Error} error */
  function errorHandler(error) {
    log.error(error.message);
    if (error.stack) {
      log.error(error.stack);
    }

    process.exit(1);
  }
  process.on("uncaughtException", errorHandler);
  process.on("unhandledRejection", errorHandler);

  const program = new Commander().name("npcs");

  Object.values(commands).forEach((CommandCtrl) => {
    if (
      Object.getPrototypeOf(CommandCtrl.prototype) === Command.prototype &&
      CommandCtrl !== Command
    ) {
      // @ts-expect-error it has excluded abstract class
      program.addCommand(new CommandCtrl().cmd);
    }
  });

  program.parse();
})();
