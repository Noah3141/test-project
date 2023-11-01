"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeCondition = exports.Job = void 0;
var utils_1 = require("./utils");
/// Values are lists to represent options in chrontab syntax, separated by commas, e.g. "15-23,0-5". This arrangement allows indefinitely many options.
var Job = /** @class */ (function () {
    function Job(_a) {
        var minute = _a.minute, hour = _a.hour, dom = _a.dom, month = _a.month, dow = _a.dow, command = _a.command, filepath = _a.filepath, id = _a.id;
        this.minute = minute;
        this.hour = hour;
        this.dom = dom;
        this.month = month;
        this.dow = dow;
        this.command = command;
        this.filepath = filepath;
        this.id = id;
    }
    Job.prototype.nextRunTime = function () {
        var now = new Date();
        // Thank the Lord indexing beyond the scope of the field returns the next year/month etc
        var minutesInHour = 60;
        var hoursInDay = 24;
        var daysInYear = 365;
        var minutesInYear = minutesInHour * hoursInDay * daysInYear;
        var nextRunTime = new Date();
        for (var minute = 0; minute < minutesInYear; minute++) {
            nextRunTime.setMinutes(nextRunTime.getMinutes() + 1);
            if (this.criteriaMet(nextRunTime)) {
                break;
            }
        }
        return nextRunTime;
    };
    Job.prototype.criteriaMet = function (time) {
        var criteriaMet = [];
        // time.setSeconds(0, 0);
        console.log(time.getMinutes());
        var minutesValid = this.minute.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getMinutes());
        });
        var hoursValid = this.hour.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getHours());
        });
        var dayOfWeekValid = this.dow.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getDay());
        });
        var dateValid = this.dom.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getDate());
        });
        var monthValid = this.month.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getMonth());
        });
        criteriaMet.push(minutesValid, hoursValid, dayOfWeekValid, dateValid, monthValid);
        (0, utils_1.log)("".concat(JSON.stringify(criteriaMet)));
        return criteriaMet.every(function (passes) { return passes; });
    };
    return Job;
}());
exports.Job = Job;
/// This is where I would like to use Zod (type checking library that upgrades from base TypeScript) instead of this pattern! This allows me to check later more simpler for type. Not a fan of doing it like this though.
var TimeCondition = /** @class */ (function () {
    function TimeCondition(_a) {
        var type = _a.type, value = _a.value, scale = _a.scale;
        this.type = type;
        this.scale = scale;
        this.value = value;
    }
    /// Converts a singular time entry into its values, e.g.
    /// ```
    ///;     */10 => [{TimeConditionType.interval, value: 10}]: TimeCondition[]
    ///;     1-6, 4-10 => [{TimeConditionType.range, value: {min:1, max:6} }, {TimeConditionType.range, value: {min:4, max:10} }]: TimeCondition[]
    /// ```
    TimeCondition.fromString = function (string, scale) {
        // Convert a string value into corresponding TimeCondition
        if (string === "*") {
            return [new TimeCondition({ type: TimeConditionType.wildcard, value: null, scale: scale })];
        }
        // ! Assumes there cannot be both a range and a repitition interval, e.g. */1-2
        var values = string.split(",");
        return values.map(function (value) {
            if (value.includes("-")) {
                var bounds = value.split("-");
                try {
                    return new TimeCondition({
                        type: TimeConditionType.range,
                        value: {
                            min: parseInt(bounds[0]),
                            max: parseInt(bounds[1]),
                        },
                        scale: scale,
                    });
                }
                catch (error) {
                    throw new Error("Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '".concat(string, "'\n\nAbove error: ").concat(JSON.stringify(error)));
                }
            }
            else if (value.includes("*/")) {
                var period = value.replace("*/", "");
                (0, utils_1.log)("Period derived from string: ".concat(period));
                try {
                    return new TimeCondition({
                        type: TimeConditionType.interval,
                        value: parseInt(period),
                        scale: scale,
                    });
                }
                catch (error) {
                    throw new Error("Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '".concat(string, "' at ").concat(period, " \n\nAbove error: ").concat(JSON.stringify(error)));
                }
            }
            else {
                try {
                    return new TimeCondition({
                        type: TimeConditionType.number,
                        value: parseInt(value),
                        scale: scale,
                    });
                }
                catch (error) {
                    throw new Error("Conversion from string value to TimeCondition failed, due to parseInt being unable to extract numbers from '".concat(value, "'\n\nAbove error: ").concat(JSON.stringify(error)));
                }
            }
        });
    };
    TimeCondition.prototype.passesCondition = function (time) {
        switch (this.type) {
            case TimeConditionType.number:
                return this.value == time;
            case TimeConditionType.interval:
                var period = this.value.period;
                return time % period === 0;
            case TimeConditionType.range:
                var min = this.value.min;
                var max = this.value.max;
                return min < time && time < max;
            case TimeConditionType.wildcard:
                return true;
        }
    };
    return TimeCondition;
}());
exports.TimeCondition = TimeCondition;
var TimeConditionType;
(function (TimeConditionType) {
    TimeConditionType[TimeConditionType["number"] = 0] = "number";
    TimeConditionType[TimeConditionType["interval"] = 1] = "interval";
    TimeConditionType[TimeConditionType["range"] = 2] = "range";
    TimeConditionType[TimeConditionType["wildcard"] = 3] = "wildcard";
})(TimeConditionType || (TimeConditionType = {}));
