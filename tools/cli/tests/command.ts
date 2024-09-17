import { Command, IOptionsValidation } from "@/command";
import { Command as Commander } from "commander";
import { describe, expect, vi } from "vitest";
import { z } from "zod";
import { nameOf } from "./test-utils";

function createCommand(
  optionsValidation: IOptionsValidation = z.object({
    foo: z.string().default("default value"),
  }) satisfies IOptionsValidation,
) {
  const name = "test";
  const description = "test desc";

  class TestCommand extends Command<IOptionsValidation> {
    constructor() {
      super(name, description, optionsValidation);
    }

    action = vi.fn(() => {});
  }

  const command = new TestCommand();
  return {
    command,
    name,
    description,
    commander: command.cmd,
  };
}

describe(Command.name, () => {
  test("cwd", () => {
    const { command } = createCommand();
    expect(command.cwd).toBe(process.cwd());
  });

  test("should return the CommanderCommand instance", () => {
    const { commander } = createCommand();
    expect(commander).toBeInstanceOf(Commander);
  });

  test("should set command name", () => {
    const { commander, name } = createCommand();

    expect(commander.name()).toBe(name);
  });

  test("should set command description", () => {
    const { commander, description } = createCommand();

    expect(commander.description()).toBe(description);
  });

  describe("options", () => {
    const createTestCommand = (option?: {
      name?: string;
      description?: string;
      defaultValue?: string;
    }) => {
      const optionDefaultValue = Object.hasOwn(option ?? {}, "defaultValue")
        ? option?.defaultValue
        : "./src";
      const optionName = option?.name ?? "inputDir";
      const optionDescription = option?.description ?? "option description";

      const { commander, command } = createCommand(
        z.object({
          [optionName]: z
            .string()
            .default(optionDefaultValue as any)
            .describe(optionDescription),
        }),
      );
      return {
        commander,
        optionName,
        optionDefaultValue,
        optionDescription,
        option: commander.options[0],
        command,
      };
    };

    test("should set default value", () => {
      const { commander, optionName, optionDefaultValue, command } =
        createTestCommand();
      expect(commander.getOptionValue(optionName)).toBe(optionDefaultValue);
      commander.parse();
      expect(command.options).toEqual({
        [optionName]: optionDefaultValue,
      });
    });

    test("should set optional=true if set default value", () => {
      const { option } = createTestCommand();
      expect(option.optional).toEqual(true);
    });

    test("should set optional=false if do not set default value", () => {
      const { option } = createTestCommand({
        defaultValue: undefined,
      });
      expect(option.optional).toEqual(false);
    });

    test("should set option description", () => {
      const { option } = createTestCommand();
      expect(option.description).toMatchInlineSnapshot(
        `"option description (defaults to "./src")"`,
      );
    });

    test("should get options from user passed", () => {
      const { commander, optionName, command } = createTestCommand();
      commander.parse([`--${optionName}`, "test"], {
        from: "user",
      });
      expect(command.options).toEqual({
        inputDir: "test",
      });
    });

    test("should not get options from user passed which is invalid", () => {
      const { commander: commander, optionName, command } = createTestCommand();

      expect(() =>
        commander.parseAsync([`--${optionName}`, 1 as any], {
          from: "user",
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: invalid options.inputDir - Expected string, received number]`,
      );
      expect(command.options).toBeUndefined();
    });
  });

  describe(nameOf<Command>("throwError"), () => {
    test("should throw an error", () => {
      const { command, name } = createCommand();
      expect(() => command.throwError("")).toThrowError();
    });

    test("should match error text", () => {
      const { command, name } = createCommand();
      expect(() =>
        command.throwError("some error happens"),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: some error happens]`);
    });
  });
});
