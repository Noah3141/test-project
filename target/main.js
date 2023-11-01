"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChronTab_1 = require("./ChronTab");
var chron = new ChronTab_1.Chron();
chron.import("./chrontab.txt");
console.log("Main: Chron filepath read and set to ".concat(chron.filepath));
