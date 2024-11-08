export class ElectricityConsumption {
  constructor(
    public readonly offPeakHours: number,
    public readonly peakHours: number,
  ) {}

  get total() {
    return this.offPeakHours + this.peakHours;
  }
}
