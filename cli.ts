import { CommandRunner } from "./src/cli/CommandRunner";
import di from "./src/di";

const commandRunner = new CommandRunner(
  [
    di.InitializeMonthlyReportCliCommand,
    di.FillDailyReportCliCommand,
    di.FillYesterdayReportCliCommand,
  ],
  di.ConsoleLogger,
);
process.exitCode = await commandRunner.run(process.argv);
