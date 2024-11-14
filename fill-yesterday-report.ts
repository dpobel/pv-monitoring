import { FillYesterdayReportCli } from "./src/cli/FillYesterdayReport";
import di from "./src/di";

const cli = new FillYesterdayReportCli(di.FillDailyReport);
await cli.run();
