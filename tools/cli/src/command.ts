import { Command as _Command } from "commander";
import { consola, type ConsolaInstance } from "consola";
import { type z } from "zod";

// TODO fix any
export type IOptionsValidation = z.ZodObject<z.ZodRawShape>;

export abstract class Command<
  TOptionsValidation extends IOptionsValidation = z.ZodObject<z.ZodRawShape>,
  TOptions = z.infer<TOptionsValidation>,
> {
  readonly cmd;
  readonly cwd = process.cwd();
  options?: TOptions;
  log: ConsolaInstance;

  constructor(
    readonly name: string,
    readonly description: string,
    readonly optionsValidation: TOptionsValidation,
  ) {
    const cmd = new _Command(this.name);
    this.log = consola.withTag(name);

    // options
    Object.entries(this.optionsValidation.shape).forEach(([key, option]) => {
      const defaultValue = option._def?.defaultValue();
      cmd.option(
        `--${key} <${key}>`,
        defaultValue !== undefined
          ? `${option.description} (defaults to ${JSON.stringify(defaultValue)})`
          : option.description,
        defaultValue,
      );
    });

    cmd
      .description(this.description) // description
      .action(this.createActionWithValidation());

    this.cmd = cmd;
  }

  abstract action(): void;

  private createActionWithValidation() {
    return async (opts: TOptions) => {
      const result = this.optionsValidation.safeParse(opts);
      if (result.error) {
        this.throwError(
          result.error.errors
            .map((e) => `invalid options.${e.path} - ${e.message}`)
            .join(";"),
        );
      }
      this.options = opts;
      await this.action();
    };
  }

  /**
   * Throw an error
   *
   * @param args
   */
  throwError(message: string): never {
    throw new Error(message);
  }
}
