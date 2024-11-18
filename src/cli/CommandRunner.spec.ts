import assert from "node:assert";
import { describe, it } from "node:test";
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

      assert.ok(testCommandExecuted);
      assert.deepEqual(testCommandOptions, {
        test: "2024-11-14",
        b: true,
        a: "test",
      });

      assert.equal(exitCode, 0);
    });

    it("should handle an unknown command", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "unknown-command",
        "--test",
      ]);
      assert.equal(exitCode, 255);
    });

    it("should handle when several commands are provided", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "test-command",
        "another-command",
        "--test",
      ]);
      assert.equal(exitCode, 255);
    });

    it("should handle when no command is provided", async () => {
      const exitCode = await commandRunner.run([
        "some/path/to/node",
        "some/path/to/cli.ts",
        "--test",
      ]);
      assert.equal(exitCode, 255);
    });
  });
});
