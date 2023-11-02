"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
var ChronTab_1 = require("./ChronTab");
exports.debug = false;
var chron = new ChronTab_1.Chron();
chron.import("./chrontab.txt");
// chron.printJobs()
// testSuite(); // Tests may have fallen out of date as they were calibrated for 11/1/2023
chron.printNextRuntimes({ criteriaLabels: false });
