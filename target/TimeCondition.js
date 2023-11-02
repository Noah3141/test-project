"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeCondition = void 0;
var utils_1 = require("./utils");
/** A particular column of a crontab job listing. Fields:
 *
 * `scale: Scale`  marks the column as one of `"minute" | "hour" | "dom" | "month" | "dow"`
 *
 * `type: TimeConditionType` marks the column for its type of condition, i.e. a value, interval, wildcard, or range
 *
 * `value: number | Interval | Range | null`, where `Interval` is a number, `Range` has a min and a max, and null encodes a wildcard.
 */
var TimeCondition = /** @class */ (function () {
    /** Validate inputted TimeCriteria */
    function TimeCondition(_a) {
        var type = _a.type, value = _a.value, scale = _a.scale, jobId = _a.jobId;
        this.validate({ type: type, value: value, scale: scale, jobId: jobId });
        this.type = type;
        this.scale = scale;
        this.value = value;
        this.jobId = jobId;
    }
    TimeCondition.prototype.validate = function (_a) {
        var type = _a.type, value = _a.value, scale = _a.scale, jobId = _a.jobId;
        switch (type) {
            case TimeConditionType.interval:
                break;
            case TimeConditionType.number:
                if (typeof value !== "number") {
                    throw new Error("Value not provided as 'number' for a TimeCondition in Job ID: ".concat(jobId));
                }
                switch (scale) {
                    case "minute":
                        if (value > 60)
                            throw new Error("Value provided for minutes above 60 for Job ID: ".concat(jobId));
                        break;
                    case "hour":
                        if (value > 60)
                            throw new Error("Value provided for hours above 60 for Job ID: ".concat(jobId));
                        break;
                    case "dom":
                        if (value > 31)
                            throw new Error("Value provided for day of month above 31 for Job ID: ".concat(jobId));
                        break;
                    case "month":
                        if (value > 12) {
                            throw new Error("Value provided for month above 12 for Job ID: ".concat(jobId));
                        }
                        break;
                    case "dow":
                        if (value > 7)
                            throw new Error("Value provided for day of week above 7 for Job ID: ".concat(jobId));
                        break;
                }
                break;
            case TimeConditionType.range:
                var _b = value, min = _b.min, max = _b.max;
                if (typeof min == "undefined" || typeof max == "undefined") {
                    throw new Error("No min/max for Job ID parsed as a range: ".concat(jobId));
                }
                if (min < 0) {
                    throw new Error("Range minimum provided below 0");
                }
                switch (scale) {
                    case "minute":
                        if (max > 60)
                            throw new Error("Range maximum for minutes above 60 for Job ID: ".concat(jobId));
                        break;
                    case "hour":
                        if (max > 60)
                            throw new Error("Range maximum for hour above 60 for Job ID: ".concat(jobId));
                        break;
                    case "dom":
                        if (max > 31)
                            throw new Error("Range maximum for day of month above 31 for Job ID: ".concat(jobId));
                        break;
                    case "month":
                        if (max > 12) {
                            throw new Error("Range maximum for month above 12 for Job ID: ".concat(jobId));
                        }
                        break;
                    case "dow":
                        if (max > 7)
                            throw new Error("Range maximum for day of week above 7 for Job ID: ".concat(jobId));
                        break;
                }
                break;
            case TimeConditionType.wildcard:
                break;
        }
    };
    /**  Converts a singular time entry into its values, e.g.
     *
     * \*\/10 `=> [{TimeConditionType.interval, value: 10}]: TimeCondition[]`
     *
     * 1-6, 4-10 `=> [{TimeConditionType.range, value: {min:1, max:6} }, {TimeConditionType.range, value: {min:4, max:10} }]: TimeCondition[]`
    /*
    */
    TimeCondition.fromString = function (string, scale, jobId) {
        // Convert a string value into corresponding TimeCondition
        // If just a wildcard, there cannot be other options, so the whole array is one TimeCondition: wildcard/null
        if (string === "*") {
            return [
                new TimeCondition({ type: TimeConditionType.wildcard, value: null, scale: scale, jobId: jobId }),
            ];
        }
        // ! Assumes there cannot be both a range and a repitition interval, e.g. */1-2
        var timeConditions = string.split(",");
        // Turn each column (`Scale`) into an array, containing each of its conditions (e.g. both of '1-6, 7-9')
        return timeConditions.map(function (value) {
            if (value.includes("-")) {
                var bounds = value.split("-");
                var min = parseInt(bounds[0]);
                var max = parseInt(bounds[1]);
                return new TimeCondition({
                    type: TimeConditionType.range,
                    value: {
                        min: min,
                        max: max,
                    },
                    scale: scale,
                    jobId: jobId,
                });
            }
            else if (value.includes("*/")) {
                var period = value.replace("*/", "");
                return new TimeCondition({
                    type: TimeConditionType.interval,
                    value: parseInt(period),
                    scale: scale,
                    jobId: jobId,
                });
            }
            else {
                return new TimeCondition({
                    type: TimeConditionType.number,
                    value: parseInt(value),
                    scale: scale,
                    jobId: jobId,
                });
            }
        });
    };
    /** Determines whether the provides number value, which could be minutes, hours, days etc (and should be passed in valid form) matches this TimeConditions criteria */
    TimeCondition.prototype.passesCondition = function (time) {
        (0, utils_1.log)("\n\n\nChecking validity of ".concat(time, " against ").concat(JSON.stringify(this, undefined, 1)));
        var pass;
        switch (this.type) {
            case TimeConditionType.number:
                pass = this.value === time;
                break;
            case TimeConditionType.interval:
                var value = this.value;
                var period = value;
                pass = time % period === 0;
                break;
            case TimeConditionType.range:
                var min = this.value.min;
                var max = this.value.max;
                (0, utils_1.log)("Range: ".concat(min, " - ").concat(max));
                pass = min <= time && time <= max;
                break;
            case TimeConditionType.wildcard:
                pass = true;
                break;
        }
        (0, utils_1.log)(pass);
        return pass;
    };
    return TimeCondition;
}());
exports.TimeCondition = TimeCondition;
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
var TimeConditionType;
(function (TimeConditionType) {
    TimeConditionType["number"] = "number";
    TimeConditionType["interval"] = "interval";
    TimeConditionType["range"] = "range";
    TimeConditionType["wildcard"] = "wildcard";
})(TimeConditionType || (TimeConditionType = {}));
