import { TimeCondition } from "./TimeCondition";
import { log } from "./utils";

/** Input to create a job.  Not actually decoupled from class' declarations */
type JobParams = {
    /** Any minute critera provided for this job*/
    minute: TimeCondition[];
    /** Any hour criteria provided for this job*/
    hour: TimeCondition[];
    /** Any day of month criteria provided for this job*/
    dom: TimeCondition[];
    /** Any month criteria provided for this job*/
    month: TimeCondition[];
    /** Day of week*/
    dow: TimeCondition[];
    /** The command to call when this `Job`'s criteria are met, e.g. `python3`*/
    command: string;
    /** The filepath to pass to this `Job`'s command*/
    filepath: string;
    /** Index for this job in a list derived from crontab file*/
    id: number;
    /** This jobs basic criteria string, e.g.  \*\/1  15-23,0-5  \*  \*  \*  */
    criteria: string;
};

/**  Values are lists to represent options in chrontab syntax, separated by commas, e.g. "15-23,0-5". This arrangement allows indefinitely many options. */
export class Job {
    /** Index for this job in a list derived from crontab file*/
    id: number;
    /** Any minute critera provided for this job */
    minute: TimeCondition[];
    /** Any hour criteria provided for this job */
    hour: TimeCondition[];
    /** Any day of month criteria provided for this job */
    dom: TimeCondition[];
    /** Any month criteria provided for this job */
    month: TimeCondition[];
    /** Any day of week criteria provided for this job */
    dow: TimeCondition[];
    /** The command to call when this `Job`'s criteria are met, e.g. `python3`*/
    /// Does not parse out command flag in this context, though could, because there's no need (no need to separate filepath either)
    command: string;
    /** The filepath to pass to this `Job`'s command*/
    filepath: string;
    /** This jobs basic criteria string, e.g.  \*\/1  15-23,0-5  \*  \*  \*  */
    criteria: string;

    /** Provides a labeled format of a `Job`'s `TimeConditions` */
    get criteriaDetailed(): string {
        const criteria = this.criteria.split(" ");
        return `
                    min: ${criteria[0]},
                    hr: ${criteria[1]}, 
                    dom: ${criteria[2]}, 
                    mo: ${criteria[3]}, 
                    dow: ${criteria[4]}`;
    }

    constructor({ minute, hour, dom, month, dow, command, filepath, id, criteria }: JobParams) {
        this.minute = minute;
        this.hour = hour;
        this.dom = dom;
        this.month = month;
        this.dow = dow;
        this.command = command;
        this.filepath = filepath;
        this.criteria = criteria;
        this.id = id;
    }

    nextRunTime(): Date | "No time within next 5 years" {
        const now = new Date();
        now.setSeconds(0, 0);
        // Prepare scope of search
        const minutesInHour = 60;
        const hoursInDay = 24;
        const daysInYear = 365;
        const minutesInYear = minutesInHour * hoursInDay * daysInYear;

        // todo) Make increments smarter so that they propose the next possible timepoints according, at least, to minutes.
        let nextRunTime = new Date();
        nextRunTime.setSeconds(0, 0);
        for (let minute = 0; minute < minutesInYear * 5; minute++) {
            // Progressively increment the proposed time until it passes checks.
            nextRunTime.setMinutes(nextRunTime.getMinutes() + 1);
            if (this.criteriaMet(nextRunTime)) {
                if (nextRunTime > now) {
                    return nextRunTime;
                }
            }
        }
        return "No time within next 5 years";
        // throw new Error(`No match found to date criteria: Job ${this.id} - ${this.criteria}\n\n`);
    }

    /** Checks if a provided Time meets all the criteria of the current `Job`s `TimeConditions` */
    criteriaMet(time: Date): boolean {
        const criteriaMet: boolean[] = [];
        // time.setSeconds(0, 0);

        const minutesValid = this.minute.some((timeCondition) =>
            timeCondition.passesCondition(time.getMinutes())
        );
        if (!minutesValid) {
            // Return early to speed up process time
            return false;
        }

        const hoursValid = this.hour.some((timeCondition) =>
            timeCondition.passesCondition(time.getHours())
        );
        if (!hoursValid) {
            return false;
        }

        const dateValid = this.dom.some((timeCondition) =>
            timeCondition.passesCondition(time.getDate())
        );
        if (!dateValid) {
            return false;
        }

        const monthValid = this.month.some((timeCondition) =>
            timeCondition.passesCondition(time.getMonth())
        );
        if (!monthValid) {
            return false;
        }

        const dayOfWeekValid = this.dow.some((timeCondition) =>
            timeCondition.passesCondition(time.getDay())
        );
        if (!dayOfWeekValid) {
            return false;
        }

        criteriaMet.push(minutesValid, hoursValid, dayOfWeekValid, dateValid, monthValid);

        log(`Criteria list: ${JSON.stringify(criteriaMet)}\n`);
        return true;
    }
}
