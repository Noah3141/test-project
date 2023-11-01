import { log } from "./utils";

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
    /// Converts a singular time entry into its values, e.g.
    /// ```
    ///;     */10 => [{TimeConditionType.interval, value: 10}]: TimeCondition[]
    ///;     1-6, 4-10 => [{TimeConditionType.range, value: {min:1, max:6} }, {TimeConditionType.range, value: {min:4, max:10} }]: TimeCondition[]
    /// ```
    static fromString(string: string, scale: Scale): TimeCondition[] {
        // Convert a string value into corresponding TimeCondition

        if (string === "*") {
            return [new TimeCondition({ type: TimeConditionType.wildcard, value: null, scale })];
        }
        // ! Assumes there cannot be both a range and a repitition interval, e.g. */1-2
        const values = string.split(",");

        return values.map((value): TimeCondition => {
            if (value.includes("-")) {
                const bounds = value.split("-");

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
            } else if (value.includes("*/")) {
                const period = value.replace("*/", "");
                log(`Period derived from string: ${period}`);
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
                        value: parseInt(value),
                        scale,
                    });
                } catch (error) {
                    throw new Error(
                        `Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '${value}'\n\nAbove error: ${JSON.stringify(
                            error
                        )}`
                    );
                }
            }
        });
    }

    passesCondition(time: number): boolean {
        switch (this.type) {
            case TimeConditionType.number:
                return this.value == time;
            case TimeConditionType.interval:
                const period = (this.value as Interval).period;
                return time % period === 0;
            case TimeConditionType.range:
                const min = (this.value as Range).min;
                const max = (this.value as Range).max;
                return min < time && time < max;
            case TimeConditionType.wildcard:
                return true;
        }
    }
}

/// This is where I would like to use Zod (type checking library that upgrades from base TypeScript) instead of this pattern! This allows me to check later more simpler for type. Not a fan of doing it like this though.
enum TimeConditionType {
    number,
    interval,
    range,
    wildcard,
}

export type Interval = { period: number };

type Range = {
    min: number;
    max: number;
};

export type Scale = "minute" | "hour" | "dom" | "month" | "dow";
