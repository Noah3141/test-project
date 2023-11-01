import { TimeCondition } from "./TimeCondition";
import { log } from "./utils";

/// Values are lists to represent options in chrontab syntax, separated by commas, e.g. "15-23,0-5". This arrangement allows indefinitely many options.
export class Job {
    id: number;
    minute: TimeCondition[];
    hour: TimeCondition[];
    /// Day of month
    dom: TimeCondition[];
    month: TimeCondition[];
    /// Day of week
    dow: TimeCondition[];
    /// Does not parse out command flag in this context, though could, because there's no need (no need to separate filepath either)
    command: string;
    filepath: string;

    constructor({ minute, hour, dom, month, dow, command, filepath, id }: JobParams) {
        this.minute = minute;
        this.hour = hour;
        this.dom = dom;
        this.month = month;
        this.dow = dow;
        this.command = command;
        this.filepath = filepath;
        this.id = id;
    }

    nextRunTime(): Date {
        const now = new Date();
        // Thank the Lord indexing beyond the scope of the field returns the next year/month etc

        const minutesInHour = 60;
        const hoursInDay = 24;
        const daysInYear = 365;
        const minutesInYear = minutesInHour * hoursInDay * daysInYear;

        let nextRunTime = new Date();
        for (let minute = 0; minute < minutesInYear; minute++) {
            nextRunTime.setMinutes(nextRunTime.getMinutes() + 1);

            if (this.criteriaMet(nextRunTime)) {
                break;
            }
        }

        return nextRunTime;
    }

    criteriaMet(time: Date): boolean {
        const criteriaMet: boolean[] = [];
        // time.setSeconds(0, 0);

        console.log(time.getMinutes());
        const minutesValid = this.minute.some((timeCondition) =>
            timeCondition.passesCondition(time.getMinutes())
        );

        const hoursValid = this.hour.some((timeCondition) =>
            timeCondition.passesCondition(time.getHours())
        );

        const dayOfWeekValid = this.dow.some((timeCondition) =>
            timeCondition.passesCondition(time.getDay())
        );

        const dateValid = this.dom.some((timeCondition) =>
            timeCondition.passesCondition(time.getDate())
        );

        const monthValid = this.month.some((timeCondition) =>
            timeCondition.passesCondition(time.getMonth())
        );

        criteriaMet.push(minutesValid, hoursValid, dayOfWeekValid, dateValid, monthValid);

        log(`${JSON.stringify(criteriaMet)}`);
        return criteriaMet.every((passes) => passes);
    }
}

// Not actually decoupled from class' declarations
type JobParams = {
    minute: TimeCondition[];
    hour: TimeCondition[];
    /// Day of month
    dom: TimeCondition[];
    month: TimeCondition[];
    /// Day of week
    dow: TimeCondition[];
    command: string;
    filepath: string;
    id: number;
};
