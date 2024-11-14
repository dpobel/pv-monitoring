export interface CliCommand {
  readonly name: string;

  run(options: Record<string, unknown>): Promise<number>;
}
