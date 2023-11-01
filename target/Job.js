"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
var Job = /** @class */ (function () {
    function Job(_a) {
        var minute = _a.minute, hour = _a.hour, dom = _a.dom, month = _a.month, dow = _a.dow;
        this.minute = minute;
        this.dom = dom;
        this.hour = hour;
        this.month = month;
        this.dow = dow;
    }
    return Job;
}());
exports.Job = Job;
