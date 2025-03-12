import { constantCase, pascalCase } from "change-case";
import fg from "fast-glob";
import fsx from "fs-extra";
import slash from "slash";

import execSh from "exec-sh";
import handlebars from "handlebars";
import { basename, dirname, extname, join, relative } from "path";
import { z } from "zod";
import { Command } from "./command";

const name = "generate-components";
const description =
  "Generate Next.js `Image` components from public image resources";

const optionsValidation = z.object({
  templatesDir: z
    .string()
    .default("./templates")
    .describe("Templates directory"),
  publicDir: z.string().default("./public").describe("Public directory"),
  outDir: z
    .string()
    .default("./src/libs/generated-components")
    .describe("Directory for generated code"),
});

// TODO unit test
export class CommandGenerateComponents extends Command<
  typeof optionsValidation
> {
  constructor() {
    super(name, description, optionsValidation);
  }

  async action() {
    const { publicDir } = this.options!;

    if (!fsx.existsSync(publicDir)) {
      this.throwError(`Public directory not found: ${publicDir}`);
    }

    const assetPaths = await fg(["**/*.{svg,png,jpg}"], {
      cwd: publicDir,
      absolute: true,
    });

    await Promise.all(
      assetPaths.map((fsPath) => this.assetToComponent(fsPath)),
    );
  }

  assetToComponent = async (fsPath: string) => {
    const ext = extname(fsPath).slice(1);
    switch (ext) {
      case "svg":
      case "png":
      case "jpg":
        await this.toImage(fsPath);
        break;

      default:
        this.throwError(`Unknown extension: ${ext}, at file path: ${fsPath}`);
    }
  };

  async toImage(fsPath: string) {
    const { outDir, publicDir, templatesDir } = this.options!;
    const url = slash(relative(publicDir, fsPath));
    if (url.startsWith(".")) {
      this.throwError(`Invalid path: ${url}`);
    }

    const handlebarsFilePath = join(templatesDir, `${dirname(url)}.handlebars`);
    if (!fsx.existsSync(handlebarsFilePath)) {
      this.log.warn(`Template file not found: ${handlebarsFilePath}`);
      return;
    }

    const fsBaseName = basename(fsPath, extname(fsPath));
    const componentVariableName = pascalCase(
      `${dirname(fsPath) === publicDir ? "Image" : basename(dirname(fsPath))}-${fsBaseName}`,
    );
    const srcVariableName = constantCase("Src" + componentVariableName);
    const outputPath = join(
      outDir,
      dirname(relative(publicDir, fsPath)),
      `${fsBaseName}.tsx`,
    );

    const template = handlebars.compile(
      await fsx.readFile(handlebarsFilePath, "utf-8"),
    );
    const content = template({
      srcVariableName,
      componentVariableName,
      url,
    });

    await fsx.ensureFile(outputPath);
    await fsx.writeFile(outputPath, content);
    try {
      execSh(`pnpm prettier ${outputPath} --write`);
    } catch (error) {
      this.log.error("Failed to format generated code:", error);
    }
    this.log.info("Generated:", outputPath);
  }
}
