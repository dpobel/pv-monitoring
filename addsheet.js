import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import creds from "./pv-monitor-440915-a8c9b3cc835c.json" with { type: "json" };

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});
const doc = new GoogleSpreadsheet(
  "12R5Jc3DKKZC_w2sAuLfMXAyO__PYNfo34LdCRTla2Oc",
  jwt,
);

await doc.loadInfo();

const sheet = await doc.addSheet({ title: "Test CLI", index: 0 });

await sheet.setHeaderRow([
  "Date",
  "HC an-1",
  "HP an-1",
  "Total an-1",
  "HC",
  "HP",
  "Total",
  "Évolution",
  "Prix (€)",
  "Production solaire",
  "Revendu",
  "Gain revente",
  "Autoconsommé",
]);
await sheet.addRow(["2024-11-01", "12", "42", "=B2+C2"]);
