import { Session as LinkyClient } from "linky";
import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { PeakHoursSchedule } from "../../PeakHoursSchedule";
import { Time } from "../../Time";
import { TimeSlot } from "../../TimeSlot";
import { Logger } from "../Logger/Logger";

export class FailToFetchElectricityConsumption extends Error {
  constructor(day: Day, error: Error) {
    super(
      `Fail to fetch electricity consumption for ${day}: ${error.message}`,
      { cause: error },
    );
  }
}

export class BokubLinkyElectricityConsumptionFetcher {
  constructor(
    private readonly linkyClient: LinkyClient,
    private readonly peakHoursSchedule: PeakHoursSchedule,
    private readonly logger: Logger,
  ) {}

  async fetch(day: Day): Promise<ElectricityConsumption> {
    try {
      const response = await this.linkyClient.getLoadCurve(
        day.YYYYMMDD,
        day.tomorrow.YYYYMMDD,
      );
      this.logger.info(
        `Fetched electricity consumption for ${day}, received`,
        response,
      );
      return this.computeConsumption(response.interval_reading);
    } catch (error) {
      throw new FailToFetchElectricityConsumption(day, error as Error);
    }
  }

  private computeConsumption(
    interval_reading: { value: string; date: string }[],
  ): ElectricityConsumption {
    let totalOffPeak = 0;
    let totalPeak = 0;
    let previousEndTime = new Time(0, 0, 0);
    for (const metering of interval_reading) {
      const endTime = this.createTime(metering.date);
      const timeSlot = new TimeSlot(previousEndTime, endTime);
      if (this.peakHoursSchedule.isInsidePeakHour(timeSlot)) {
        totalPeak += Number(metering.value);
      } else {
        totalOffPeak += Number(metering.value);
      }
      previousEndTime = endTime;
    }
    return new ElectricityConsumption(totalOffPeak / 2, totalPeak / 2);
  }

  private createTime(datetime: string) {
    const [_, timeString] = datetime.split(" ");
    if (timeString === "00:00:00") {
      return new Time(23, 59, 59);
    }
    const [hour, minute, second] = timeString.split(":").map(Number);
    return new Time(hour, minute, second);
  }
}
