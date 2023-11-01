"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
var ChronTab_1 = require("./ChronTab");
function assertEqual(actual, expected, message) {
    if (message === void 0) { message = ""; }
    if (actual !== expected) {
        throw new Error("Assertion failed: ".concat(message, ". \n            \n     Provided: ").concat(actual, ",\n            \n     !=\n            \n     Expected: ").concat(expected, "\n            \n\n\r"));
    }
}
exports.debug = true;
var chron = new ChronTab_1.Chron();
chron.import("./chrontab.txt");
console.log("Main: Chron filepath read and set to ".concat(chron.filepath));
console.log(chron.jobs[2].nextRunTime());
// chron.printNextJobTimes()
assertEqual((_a = chron.jobs.at(0)) === null || _a === void 0 ? void 0 : _a.nextRunTime(), // Minutely
new Date(2023, 11, 1, new Date().getHours(), new Date().getMinutes() + 1), "Test 1");
