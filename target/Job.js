"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
var utils_1 = require("./utils");
/**  Values are lists to represent options in chrontab syntax, separated by commas, e.g. "15-23,0-5". This arrangement allows indefinitely many options. */
var Job = /** @class */ (function () {
    function Job(_a) {
        var minute = _a.minute, hour = _a.hour, dom = _a.dom, month = _a.month, dow = _a.dow, command = _a.command, filepath = _a.filepath, id = _a.id, criteria = _a.criteria;
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
    Object.defineProperty(Job.prototype, "criteriaDetailed", {
        /** Provides a labeled format of a `Job`'s `TimeConditions` */
        get: function () {
            var criteria = this.criteria.split(" ");
            return "\n                    min: ".concat(criteria[0], ",\n                    hr: ").concat(criteria[1], ", \n                    dom: ").concat(criteria[2], ", \n                    mo: ").concat(criteria[3], ", \n                    dow: ").concat(criteria[4]);
        },
        enumerable: false,
        configurable: true
    });
    Job.prototype.nextRunTime = function () {
        var now = new Date();
        now.setSeconds(0, 0);
        // Prepare scope of search
        var minutesInHour = 60;
        var hoursInDay = 24;
        var daysInYear = 365;
        var minutesInYear = minutesInHour * hoursInDay * daysInYear;
        // todo) Make increments smarter so that they propose the next possible timepoints according, at least, to minutes.
        var nextRunTime = new Date();
        nextRunTime.setSeconds(0, 0);
        for (var minute = 0; minute < minutesInYear * 5; minute++) {
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
    };
    /** Checks if a provided Time meets all the criteria of the current `Job`s `TimeConditions` */
    Job.prototype.criteriaMet = function (time) {
        var criteriaMet = [];
        // time.setSeconds(0, 0);
        var minutesValid = this.minute.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getMinutes());
        });
        if (!minutesValid) {
            // Return early to speed up process time
            return false;
        }
        var hoursValid = this.hour.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getHours());
        });
        if (!hoursValid) {
            return false;
        }
        var dateValid = this.dom.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getDate());
        });
        if (!dateValid) {
            return false;
        }
        var monthValid = this.month.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getMonth());
        });
        if (!monthValid) {
            return false;
        }
        var dayOfWeekValid = this.dow.some(function (timeCondition) {
            return timeCondition.passesCondition(time.getDay());
        });
        if (!dayOfWeekValid) {
            return false;
        }
        criteriaMet.push(minutesValid, hoursValid, dayOfWeekValid, dateValid, monthValid);
        (0, utils_1.log)("Criteria list: ".concat(JSON.stringify(criteriaMet), "\n"));
        return true;
    };
    return Job;
}());
exports.Job = Job;
