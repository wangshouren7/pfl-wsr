import { Command, type IOptionsValidation } from "@/command";
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
    const createTestCommand = () => {
      const optionDefaultValue = "./src";
      const optionName = "inputDir";
      const optionDescription = "option description";
      const { commander, command } = createCommand(
        z.object({
          [optionName]: z
            .string()
            .default(optionDefaultValue)
            .describe(optionDescription),
        }),
      );
      const option = commander.options[0];
      return {
        commander,
        optionName,
        optionDefaultValue,
        optionDescription,
        option,
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
        commander.parseAsync([`--${optionName}`, "1"], {
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
      const { command } = createCommand();
      expect(() => command.throwError("")).toThrowError();
    });

    test("should match error text", () => {
      const { command } = createCommand();
      expect(() =>
        command.throwError("some error happens"),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: some error happens]`);
    });
  });
});
