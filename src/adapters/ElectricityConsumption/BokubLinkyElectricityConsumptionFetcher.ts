import { APIError, Session as LinkyClient } from "linky";
import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { PeakHoursSchedule } from "../../PeakHoursSchedule";
import { Time } from "../../Time";
import { InvalidTimeSlotSameStartAndEnd, TimeSlot } from "../../TimeSlot";
import { Logger } from "../Logger/Logger";
import { ElectricityConsumptionFetcher } from "./ElectricityConsumptionFetcher";

export class FailToFetchElectricityConsumption extends Error {
  public readonly responseMessage: unknown;
  public readonly responseError: unknown;

  constructor(day: Day, error: Error) {
    super(
      `Fail to fetch electricity consumption for ${day}: ${error.message}`,
      { cause: error },
    );
    if (error instanceof APIError) {
      this.responseMessage = error.response.message;
      this.responseError = error.response.error;
    }
  }
}

// the `linky` library types `interval_reading` without `interval_length`, but
// the API does return it, so we refine the type locally.
// TODO: report or fix it in a PR
type IntervalReading = {
  value: string;
  date: string;
  interval_length: "PT15M" | "PT30M";
};

export class BokubLinkyElectricityConsumptionFetcher
  implements ElectricityConsumptionFetcher
{
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
      return this.computeConsumption(
        (response.interval_reading as IntervalReading[]).sort(
          (measure1, measure2) => {
            return measure1.date.localeCompare(measure2.date);
          },
        ),
      );
    } catch (error) {
      throw new FailToFetchElectricityConsumption(day, error as Error);
    }
  }

  private computeConsumption(
    interval_reading: IntervalReading[],
  ): ElectricityConsumption {
    let totalOffPeak = 0;
    let totalPeak = 0;
    let previousEndTime = new Time(0, 0, 0);
    for (const metering of interval_reading) {
      const endTime = this.createTime(metering.date);
      const timeSlot = this.createTimeSlot(
        previousEndTime,
        endTime,
        metering.interval_length,
      );
      if (this.peakHoursSchedule.isInsidePeakHour(timeSlot)) {
        totalPeak += Number(metering.value);
      } else {
        totalOffPeak += Number(metering.value);
      }
      previousEndTime = endTime;
    }
    const divisor = interval_reading[0]?.interval_length === "PT15M" ? 4 : 2;
    // each value is a mean of the power consumption during a timeslot so we need to divide by the number of timeslot
    // per hour. Since the beginning of may 2026, intervals are 15 minutes long, previously they were 30 minutes long.
    return new ElectricityConsumption(
      totalOffPeak / divisor,
      totalPeak / divisor,
    );
  }

  private createTimeSlot(
    startTime: Time,
    endTime: Time,
    intervalLength: "PT15M" | "PT30M",
  ) {
    // day light saving time related issue is detected based on the fact that both times are the same and are either
    // 02:00:00, 02:15:00, 02:30:00 or 02:45:00 that could perfectly happen not only on DST change days, but the
    // probability is low enough to ignore it
    try {
      return new TimeSlot(startTime, endTime);
    } catch (error) {
      if (
        error instanceof InvalidTimeSlotSameStartAndEnd &&
        error.isDayLightSavingTime()
      ) {
        return new TimeSlot(
          startTime,
          startTime.addMinutes(intervalLength === "PT30M" ? 30 : 15),
        );
      }
      throw error;
    }
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
