import { findWorkspaceDir } from "@pnpm/find-workspace-dir";
import { findWorkspacePackages } from "@pnpm/workspace.find-packages";
import execSh from "exec-sh";
import inquirer from "inquirer";
import { z } from "zod";
import { Command, type IOptionsValidation } from "./command";

const name = "storybook";
const description = "Start storybook server of app";
const options = z.object({}) satisfies IOptionsValidation;

export class CommandStorybook extends Command<typeof options> {
  constructor() {
    super(name, description, options);
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

    inquirer
      .prompt([
        {
          type: "list",
          name: "packageName",
          message: "Select app",
          choices: apps.map((x) => x.manifest.name!),
        },
      ])
      .then(({ packageName }) => {
        execSh(`turbo storybook --filter=${packageName}`, {
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
}
