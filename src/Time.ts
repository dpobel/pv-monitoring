export class Time {
  constructor(
    public readonly hour: number,
    public readonly minute: number,
    public readonly second: number,
  ) {}

  isBefore(time: Time): boolean {
    return (
      this.hour < time.hour ||
      (this.hour === time.hour && this.minute < time.minute) ||
      (this.hour === time.hour &&
        this.minute === time.minute &&
        this.second < time.second)
    );
  }

  isAfter(time: Time): boolean {
    return (
      this.hour > time.hour ||
      (this.hour === time.hour && this.minute > time.minute) ||
      (this.hour === time.hour &&
        this.minute === time.minute &&
        this.second > time.second)
    );
  }

  isEqualTo(time: Time): boolean {
    return (
      this.hour === time.hour &&
      this.minute === time.minute &&
      this.second === time.second
    );
  }

  toString(): string {
    return `${this.hour.toString().padStart(2, "0")}:${this.minute
      .toString()
      .padStart(2, "0")}:${this.second.toString().padStart(2, "0")}`;
  }
}
