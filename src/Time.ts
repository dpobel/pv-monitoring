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

  addMinutes(minutesToAdd: number): Time {
    const totalMinutes = this.hour * 60 + this.minute + minutesToAdd;
    const newHour = Math.floor(totalMinutes / 60) % 24;
    const newMinute = totalMinutes % 60;
    if (newHour === 0 && newMinute === 0 && this.second === 0) {
      return new Time(23, 59, 59);
    }
    return new Time(newHour, newMinute, this.second);
  }

  toString(): string {
    return `${this.hour.toString().padStart(2, "0")}:${this.minute
      .toString()
      .padStart(2, "0")}:${this.second.toString().padStart(2, "0")}`;
  }
}
