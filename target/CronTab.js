"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chron = void 0;
var fs = require("fs");
var Job_1 = require("./Job");
var TimeCondition_1 = require("./TimeCondition");
/// Overall ojbect wrapper for the task
var Chron = /** @class */ (function () {
    function Chron() {
    }
    Object.defineProperty(Chron.prototype, "mailTo", {
        /// Return the current value of `mailTo`
        get: function () {
            return this._mailTo;
        },
        /// Sets the value of mailTo to the provided email, if valid, updating ...
        set: function (email) {
            // todo) Validate input string
            var validatedEmail = email;
            // todo) Make sideffects
            this._mailTo = validatedEmail;
        },
        enumerable: false,
        configurable: true
    });
    /// Reads provided filepath into instance, saving in filepath property
    Chron.prototype.import = function (filepath) {
        // todo) Validate filepath as a filepath
        // Depending on the language, catch error for type. Not sure if this is the preferred typescript pattern for this. Return specific prompt for failure modes
        var fileText = "";
        try {
            fileText = fs.readFileSync(filepath, { encoding: "utf8" });
        }
        catch (err) {
            if (err.code === "ENOENT") {
                console.log("File not found at specified path: ".concat(filepath));
            }
            else {
                console.log("Something went wrong reading specified file path ".concat(filepath));
            }
        }
        if (fileText === "") {
            throw new Error("File read succeeded, but text was returned as empty! Chron attributes have not been modified.");
        }
        this.parseText(fileText);
        // If no errors, update filepath value
        this.filepath = filepath;
        console.log("Chron: Instance updated with new filepath.");
    };
    /// Takes in a chrontab file's text, and updates the instance accordingly. Errors if syntax is invalid. Does not update values if errors on parse
    Chron.prototype.parseText = function (fileText) {
        // Preprocess text
        var lines = fileText
            .split("\n")
            .filter(function (line) { return !line.startsWith("#"); }) // Remove comments
            .map(function (line) { return line.replace("\r", ""); }) // For my readability sake
            .filter(function (line) { return line !== ""; }); // Remove empty lines
        // Try to build a job out of each line, adding to roster if successful, and stoppiing the Chron update if not
        var jobsRoster = lines.map(function (line, idx) {
            var lineParts = line.split(/\s+/); // Some people say to never use regex, In this case I think it is a parsimonious way to handle variable spaces due to formatting of input file
            // 7 lines parts corresponds to the basic job listing
            var timeValues = lineParts.slice(0, 5);
            var commandValues = lineParts.slice(5);
            var lastIndex = commandValues.length - 1; // (Not in love with this pattern)
            var filepath = commandValues[lastIndex];
            var command = commandValues.slice(0, lastIndex).join(" ");
            // console.log("line", line);
            // console.log("lineParts", lineParts);
            // console.log("timeValues", timeValues);
            // console.log("commandValues", commandValues);
            var minute = TimeCondition_1.TimeCondition.fromString(timeValues[0], "minute");
            var hour = TimeCondition_1.TimeCondition.fromString(timeValues[1], "hour");
            var dom = TimeCondition_1.TimeCondition.fromString(timeValues[2], "dom");
            var month = TimeCondition_1.TimeCondition.fromString(timeValues[3], "month");
            var dow = TimeCondition_1.TimeCondition.fromString(timeValues[4], "dow");
            return new Job_1.Job({
                minute: minute,
                hour: hour,
                dom: dom,
                month: month,
                dow: dow,
                command: command,
                filepath: filepath,
                id: idx,
            });
        });
        this.jobs = jobsRoster;
        console.log("Chron: Instance updated with new job roster.");
    };
    Chron.prototype.printJobs = function () {
        this.jobs.map(function (job, idx) {
            console.log("\nJob ".concat(idx, ": ").concat(JSON.stringify(job, null, 2)));
        });
    };
    return Chron;
}());
exports.Chron = Chron;
