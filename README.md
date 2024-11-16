# pv-monitoring

Monitor my photovoltaic installation and electricity consumption by filling a
Google Spreadsheet.

## CLI

### Initialize a monthly report

```bash
npm run initialize-monthly-report [-- --month=2024-11]
```

`--month` is optional. If omitted, the current month is used.

_This command is scheduled to be run every first day of month._

### Fill yesterday report

```bash
npm run fill-yesterday-report
```

_This command is scheduled to be run every day._

### Fill daily report

```bash
npm run fill-daily-report -- --date=2024-11-16
```

## Setup

1. `npm install`
1. Create a Google Spreadsheet
1. Follow [Authentication page on google-spreadsheet documentation](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication) (service account way)
1. Fill `.env` variables
