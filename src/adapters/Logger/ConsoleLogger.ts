import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  info(message: string, data?: unknown): void {
    this.log(`[INFO] ${message}`, data);
  }
  warn(message: string, data?: unknown): void {
    this.log(`[WARN] ${message}`, data);
  }
  error(message: string, data?: unknown): void {
    this.log(`[ERROR] ${message}`, data);
  }

  private log(message: string, data?: unknown): void {
    if (data === undefined) {
      console.log(message);
      return;
    }
    console.log(message, data);
  }
}
