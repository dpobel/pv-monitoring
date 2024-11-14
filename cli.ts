import { ConsoleLogger } from "./src/adapters/Logger/ConsoleLogger";
import { CommandRunner } from "./src/cli/CommandRunner";
import di from "./src/di";

const commandRunner = new CommandRunner(
  [
    di.InitializeMonthlyReportCliCommand,
    di.FillDailyReportCliCommand,
    di.FillYesterdayReportCliCommand,
  ],
  new ConsoleLogger(),
);
process.exitCode = await commandRunner.run(process.argv);
