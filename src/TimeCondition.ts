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

    constructor({
        type,
        value,
        scale,
    }: {
        type: TimeConditionType;
        value: number | Interval | Range | null;
        scale: Scale;
    }) {
        this.type = type;
        this.scale = scale;
        this.value = value;
    }
    /**  Converts a singular time entry into its values, e.g.
     * 
     * \*\/10 `=> [{TimeConditionType.interval, value: 10}]: TimeCondition[]`
     * 
     * 1-6, 4-10 `=> [{TimeConditionType.range, value: {min:1, max:6} }, {TimeConditionType.range, value: {min:4, max:10} }]: TimeCondition[]`
    /* 
    */
    static fromString(string: string, scale: Scale): TimeCondition[] {
        // Convert a string value into corresponding TimeCondition

        // If just a wildcard, there cannot be other options, so the whole array is one TimeCondition: wildcard/null
        if (string === "*") {
            return [new TimeCondition({ type: TimeConditionType.wildcard, value: null, scale })];
        }
        // ! Assumes there cannot be both a range and a repitition interval, e.g. */1-2
        const timeConditions = string.split(",");

        // Turn each column (`Scale`) into an array, containing each of its conditions (e.g. both of '1-6, 7-9')
        return timeConditions.map((condition): TimeCondition => {
            if (condition.includes("-")) {
                const bounds = condition.split("-");
                try {
                    return new TimeCondition({
                        type: TimeConditionType.range,
                        value: {
                            min: parseInt(bounds[0]),
                            max: parseInt(bounds[1]),
                        },
                        scale,
                    });
                } catch (error) {
                    throw new Error(
                        `Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '${string}'\n\nAbove error: ${JSON.stringify(
                            error
                        )}`
                    );
                }
            } else if (condition.includes("*/")) {
                const period = condition.replace("*/", "");
                try {
                    return new TimeCondition({
                        type: TimeConditionType.interval,
                        value: parseInt(period),
                        scale,
                    });
                } catch (error) {
                    throw new Error(
                        `Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '${string}' at ${period} \n\nAbove error: ${JSON.stringify(
                            error
                        )}`
                    );
                }
            } else {
                try {
                    return new TimeCondition({
                        type: TimeConditionType.number,
                        value: parseInt(condition),
                        scale,
                    });
                } catch (error) {
                    throw new Error(
                        `Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '${string}'\n\nAbove error: ${JSON.stringify(
                            error
                        )}`
                    );
                }
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
