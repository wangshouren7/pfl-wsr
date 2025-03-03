import { findWorkspaceDir } from "@pnpm/find-workspace-dir";
import { findWorkspacePackages, Project } from "@pnpm/workspace.find-packages";
import execSh from "exec-sh";
import inquirer from "inquirer";
import { z } from "zod";
import { Command, IOptionsValidation } from "./command";
import * as dc from "docker-compose";

const name = "dev";
const description = "Start develop app";
const options = z.object({}) satisfies IOptionsValidation;

export class CommandDev extends Command<typeof options> {
  constructor() {
    super(name, description, options);
    this.cmd.allowUnknownOption();
  }

  async action() {
    const workspace = await findWorkspaceDir(this.cwd);
    if (!workspace) {
      this.throwError("Not a workspace");
    }

    const apps = (
      await findWorkspacePackages(workspace, {
        patterns: ["./apps/*"],
      })
    ).filter((x) => x.rootDir !== workspace);
    dc.ps;
    await dc.version({ cwd: workspace, log: true });
    await dc.upAll({
      cwd: workspace,
      log: true,
      config: "db.docker-compose.yml",
    });

    const currentApp = apps.find((x) => x.rootDir === this.cwd);
    if (currentApp) {
      this.startApp(currentApp);
      return;
    }

    inquirer
      .prompt([
        {
          type: "list",
          name: "packageName",
          message: "Select app",
          choices: apps.map((x) => x.manifest.name!),
        } as any,
      ])
      .then(({ packageName }) => {
        execSh(`turbo dev --filter=${packageName}`, {
          cwd: workspace,
        });
      })
      .catch((error) => {
        if (error.isTtyError) {
          this.throwError(
            `Prompt couldn't be rendered in the current environment`,
          );
        } else {
          this.throwError(error.message);
        }
      });
  }

  startApp(app: Project) {
    execSh(`pnpm next dev`, {
      cwd: app.rootDir,
    });
  }
}
