"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
var ChronTab_1 = require("./ChronTab");
var test_1 = require("./test");
exports.debug = false;
var chron = new ChronTab_1.Chron();
chron.import("./chrontab.txt");
// chron.printJobs()
(0, test_1.testSuite)();
chron.printNextRuntimes({ criteriaLabels: false });
