import { Logger } from "./Logger";

export class NullLogger implements Logger {
  info(_message: string, _data?: unknown): void {}
  warn(_message: string, _data?: unknown): void {}
  error(_message: string, _data?: unknown): void {}
}
