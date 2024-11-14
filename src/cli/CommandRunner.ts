import minimist from "minimist";
import { Logger } from "../adapters/Logger/Logger";
import { CliCommand } from "./CliCommand";

class CommandNotFound extends Error {
  constructor(name: string) {
    super(`Command with name "${name}" not found`);
  }
}

class MissingCommand extends Error {
  constructor() {
    super("The command is missing");
  }
}

class TooManyCommands extends Error {
  constructor(commands: string[]) {
    super(`Too many commands: ${commands.join(",")}`);
  }
}

export class CommandRunner {
  constructor(
    private readonly clis: CliCommand[],
    private readonly logger: Logger,
  ) {}

  async run(argv: string[]) {
    let args: { command: string; options: Record<string, unknown> };
    let cli: CliCommand;
    try {
      args = this.parseArguments(argv);
      cli = this.findCliCommand(args.command);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
      return 255;
    }
    return await cli.run(args.options);
  }

  private findCliCommand(name: string) {
    const cliCommand = this.clis.find((cli) => {
      return cli.name === name;
    });

    if (!cliCommand) {
      throw new CommandNotFound(name);
    }
    return cliCommand;
  }

  private parseArguments(argv: string[]) {
    const args = minimist(argv.slice(2));

    const { _, ...options } = args;
    if (_.length > 1) {
      throw new TooManyCommands(_);
    }
    const command = _[0];
    if (!command) {
      throw new MissingCommand();
    }

    return {
      command,
      options,
    };
  }
}
