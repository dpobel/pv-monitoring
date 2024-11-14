import { InitializeMonthlyReportCli } from "./src/cli/InitializeMonthlyReport";
import di from "./src/di";

const cli = new InitializeMonthlyReportCli(di.InitializeMonthlyReport);
await cli.run();
