import { NullLogger } from "../adapters/Logger/NullLogger";
import { CliCommand } from "./CliCommand";
import { CommandRunner } from "./CommandRunner";

describe("CommandRunner", () => {
  let testCommandExecuted = false;
  let testCommandOptions: Record<string, unknown> | undefined = undefined;
  class TestCommand implements CliCommand {
    name = "test-command";

    async run(options: Record<string, unknown>) {
      testCommandOptions = options;
      testCommandExecuted = true;
      return 0;
    }
  }

  const commandRunner = new CommandRunner(
    [new TestCommand()],
    new NullLogger(),
  );
  describe("run", () => {
    it("should run a command", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "test-command",
        "--test=2024-11-14",
        "-b",
        "-a",
        "test",
      ]);

      expect(testCommandExecuted).toBe(true);
      expect(testCommandOptions).toEqual({
        test: "2024-11-14",
        b: true,
        a: "test",
      });

      expect(exitCode).toEqual(0);
    });

    it("should handle an unknown command", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "unknown-command",
        "--test",
      ]);
      expect(exitCode).toEqual(255);
    });

    it("should handle when several commands are provided", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "test-command",
        "another-command",
        "--test",
      ]);
      expect(exitCode).toEqual(255);
    });

    it("should handle when no command is provided", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "--test",
      ]);
      expect(exitCode).toEqual(255);
    });
  });
});
