import { log } from "./utils";

/** A particular column of a crontab job listing. Fields:
 *
 * `scale: Scale`  marks the column as one of `"minute" | "hour" | "dom" | "month" | "dow"`
 *
 * `type: TimeConditionType` marks the column for its type of condition, i.e. a value, interval, wildcard, or range
 *
 * `value: number | Interval | Range | null`, where `Interval` is a number, `Range` has a min and a max, and null encodes a wildcard.
 */
export class TimeCondition {
    scale: Scale;
    type: TimeConditionType;
    value: number | Interval | Range | null;
    jobId: number;

    /** Validate inputted TimeCriteria */
    constructor({
        type,
        value,
        scale,
        jobId,
    }: {
        type: TimeConditionType;
        value: number | Interval | Range | null;
        scale: Scale;
        jobId: number;
    }) {
        this.validate({ type, value, scale, jobId });

        this.type = type;
        this.scale = scale;
        this.value = value;
        this.jobId = jobId;
    }

    /** Check that provided values are valid for each column, e.g. no day of week as 12, no month as 30 */
    validate({
        type,
        value,
        scale,
        jobId,
    }: {
        type: TimeConditionType;
        value: number | Interval | Range | null;
        scale: Scale;
        jobId: number;
    }) {
        switch (type) {
            case TimeConditionType.interval:
                break;
            case TimeConditionType.number:
                if (typeof value !== "number") {
                    throw new Error(
                        `Value not provided as 'number' for a TimeCondition in Job ID: ${jobId}`
                    );
                }
                switch (scale) {
                    case `minute`:
                        if (value > 60)
                            throw new Error(
                                `Value provided for minutes above 60 for Job ID: ${jobId}`
                            );
                        break;
                    case `hour`:
                        if (value > 60)
                            throw new Error(
                                `Value provided for hours above 60 for Job ID: ${jobId}`
                            );
                        break;
                    case `dom`:
                        if (value > 31)
                            throw new Error(
                                `Value provided for day of month above 31 for Job ID: ${jobId}`
                            );
                        break;
                    case `month`:
                        if (value > 12) {
                            throw new Error(
                                `Value provided for month above 12 for Job ID: ${jobId}`
                            );
                        }
                        break;
                    case `dow`:
                        if (value > 7)
                            throw new Error(
                                `Value provided for day of week above 7 for Job ID: ${jobId}`
                            );
                        break;
                }
                break;
            case TimeConditionType.range:
                const { min, max } = value as Range;
                if (typeof min == "undefined" || typeof max == "undefined") {
                    throw new Error(`No min/max for Job ID parsed as a range: ${jobId}`);
                }
                if (min < 0) {
                    throw new Error(`Range minimum provided below 0`);
                }
                switch (scale) {
                    case `minute`:
                        if (max > 60)
                            throw new Error(
                                `Range maximum for minutes above 60 for Job ID: ${jobId}`
                            );
                        break;
                    case `hour`:
                        if (max > 60)
                            throw new Error(`Range maximum for hour above 60 for Job ID: ${jobId}`);
                        break;
                    case `dom`:
                        if (max > 31)
                            throw new Error(
                                `Range maximum for day of month above 31 for Job ID: ${jobId}`
                            );
                        break;
                    case `month`:
                        if (max > 12) {
                            throw new Error(
                                `Range maximum for month above 12 for Job ID: ${jobId}`
                            );
                        }
                        break;
                    case `dow`:
                        if (max > 7)
                            throw new Error(
                                `Range maximum for day of week above 7 for Job ID: ${jobId}`
                            );
                        break;
                }
                break;
            case TimeConditionType.wildcard:
                break;
        }
    }

    /**  Converts a singular time entry into its values, e.g.
     * 
     * \*\/10 `=> [{TimeConditionType.interval, value: 10}]: TimeCondition[]`
     * 
     * 1-6, 4-10 `=> [{TimeConditionType.range, value: {min:1, max:6} }, {TimeConditionType.range, value: {min:4, max:10} }]: TimeCondition[]`
    /* 
    */
    static fromString(string: string, scale: Scale, jobId: number): TimeCondition[] {
        // Convert a string value into corresponding TimeCondition

        // If just a wildcard, there cannot be other options, so the whole array is one TimeCondition: wildcard/null
        if (string === "*") {
            return [
                new TimeCondition({ type: TimeConditionType.wildcard, value: null, scale, jobId }),
            ];
        }
        // ! Assumes there cannot be both a range and a repitition interval, e.g. */1-2
        const timeConditions = string.split(",");

        // Turn each column (`Scale`) into an array, containing each of its conditions (e.g. both of '1-6, 7-9')
        return timeConditions.map((value): TimeCondition => {
            if (value.includes("-")) {
                const bounds = value.split("-");
                const min = parseInt(bounds[0]);
                const max = parseInt(bounds[1]);

                return new TimeCondition({
                    type: TimeConditionType.range,
                    value: {
                        min,
                        max,
                    },
                    scale,
                    jobId,
                });
            } else if (value.includes("*/")) {
                const period = value.replace("*/", "");
                return new TimeCondition({
                    type: TimeConditionType.interval,
                    value: parseInt(period),
                    scale,
                    jobId,
                });
            } else {
                return new TimeCondition({
                    type: TimeConditionType.number,
                    value: parseInt(value),
                    scale,
                    jobId,
                });
            }
        });
    }

    /** Determines whether the provides number value, which could be minutes, hours, days etc (and should be passed in valid form) matches this TimeConditions criteria */
    passesCondition(time: number): boolean {
        log(`\n\n\nChecking validity of ${time} against ${JSON.stringify(this, undefined, 1)}`);
        let pass;
        switch (this.type) {
            case TimeConditionType.number:
                pass = this.value === time;
                break;

            case TimeConditionType.interval:
                const value: Interval = this.value as Interval;
                const period = value;
                pass = time % period === 0;
                break;

            case TimeConditionType.range:
                const min = (this.value as Range).min;
                const max = (this.value as Range).max;
                log(`Range: ${min} - ${max}`);
                pass = min <= time && time <= max;
                break;

            case TimeConditionType.wildcard:
                pass = true;
                break;
        }
        log(pass);
        return pass;
    }
}

/// This is where I would like to use Zod (type checking library that upgrades from base TypeScript) instead of this pattern! This allows me to check later more simpler for type. Not a fan of doing it like this though.
/** Possible variants of a time condition
 *
 * number, e.g. 6
 *
 * interval, e.g. \*\/2 ("every second")
 *
 * range, e.g. 6-12 (inclusive both ends)
 *
 * wildcard, e.g. * (any value)
 */
enum TimeConditionType {
    number = "number",
    interval = "interval",
    range = "range",
    wildcard = "wildcard",
}

/** Labels a number as an Interval, as in  \*\/5 */
export type Interval = number;

type Range = {
    min: number;
    max: number;
};

export type Scale = "minute" | "hour" | "dom" | "month" | "dow";
