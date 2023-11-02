"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
var main_1 = require("./main");
var log = function (msg) {
    if (main_1.debug) {
        console.log(msg);
    }
};
exports.log = log;
