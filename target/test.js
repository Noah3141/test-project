"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSuite = void 0;
var ChronTab_1 = require("./ChronTab");
var assertEqual = function (calculated, desired, label) {
    if (label === void 0) { label = ""; }
    calculated.setSeconds(0, 0);
    desired.setSeconds(0, 0);
    if (calculated.getTime() !== desired.getTime()) {
        throw new Error("\u274C  Assertion failed for: ".concat(label, ". \n            \n     Provided: ").concat(calculated, ",\n            \n     !=\n            \n     Desired: ").concat(desired, "\n            \n\n\r"));
    }
    else {
        console.log("\u2705  ".concat(label, " passed"));
    }
};
var testSuite = function () {
    var _a, _b, _c, _d;
    var chron = new ChronTab_1.Chron();
    chron.import("./chrontab.txt");
    // Test Job 1
    var desired1 = new Date();
    desired1.setMinutes(desired1.getMinutes() + 1);
    var calculated1 = (_a = chron.jobs.at(0)) === null || _a === void 0 ? void 0 : _a.nextRunTime();
    assertEqual(calculated1, // Minutely
    desired1, "Job Test 1");
    // Test Job 2
    var desired2 = new Date("2023-11-01T20:01:43-05:00");
    var calculated2 = (_b = chron.jobs.at(11)) === null || _b === void 0 ? void 0 : _b.nextRunTime();
    assertEqual(calculated2, // Minutely
    desired2, "Job Test 2");
    // Test Job 3
    var desired3 = new Date("2023-11-02T02:50:27-05:00");
    var calculated3 = (_c = chron.jobs.at(16)) === null || _c === void 0 ? void 0 : _c.nextRunTime();
    assertEqual(calculated3, // Minutely
    desired3, "Job Test 3");
    // Test Job 4
    var desired4 = new Date("2023-11-01T20:01:27-05:00");
    var calculated4 = (_d = chron.jobs.at(11)) === null || _d === void 0 ? void 0 : _d.nextRunTime();
    assertEqual(calculated4, // Minutely
    desired4, "Job Test 4");
};
exports.testSuite = testSuite;
