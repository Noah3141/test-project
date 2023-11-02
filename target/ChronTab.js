"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chron = void 0;
var fs = require("fs");
var Job_1 = require("./Job");
var TimeCondition_1 = require("./TimeCondition");
var utils_1 = require("./utils");
/** Overall ojbect wrapper for the task */
var Chron = /** @class */ (function () {
    function Chron() {
    }
    Object.defineProperty(Chron.prototype, "jobs", {
        get: function () {
            return this._jobs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chron.prototype, "mailTo", {
        /**  Return the current value of `mailTo` */
        get: function () {
            return this._mailTo;
        },
        /**  Sets the value of mailTo to the provided email, if valid, updating ... */
        set: function (email) {
            if (!email || !email.includes("@")) {
                console.error("\u274C  Invalid email fed to Chron. Value not updated. Email parsed from '".concat(this.filepath, "' as ").concat(email));
            }
            else {
                var validatedEmail = email;
                // todo) Make sideffects
                this._mailTo = validatedEmail;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**  Reads provided filepath into instance, saving in filepath property, retrieving email, and setting jobs list to file contents */
    Chron.prototype.import = function (filepath) {
        // Validate filepath string
        if (!filepath) {
            throw new Error("Chron: No filepath provided to `.import()`");
        }
        var invalidCharacters = /[<>:"|?*]/; // ?) This may need tweaking
        if (invalidCharacters.test(filepath)) {
            throw new Error("Chron: Invalid characters found in filepath provided to `.import()`");
        }
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
        (0, utils_1.log)("Chron: Instance updated with new filepath.");
    };
    /** Takes in a chrontab file's text, and updates the instance accordingly. Assumes proper syntax. Arbitrarily large number of flags can be passed to command. Does not update values if errors on parse. */
    Chron.prototype.parseText = function (fileText) {
        // Preprocess text
        var email;
        var lines = fileText
            .split("\n")
            .filter(function (line) {
            var _a;
            if (line.startsWith("#MAILTO")) {
                var quotedText = /"([^"]*)"/g; // "Get me a collection of any number of things that aren't a quote that are between two quotes"
                email = (_a = line.match(quotedText)) === null || _a === void 0 ? void 0 : _a.at(0);
                return false; // remove line
            }
            else {
                return !line.startsWith("#");
            }
        }) // Remove comments
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
            var minute = TimeCondition_1.TimeCondition.fromString(timeValues[0], "minute", idx);
            var hour = TimeCondition_1.TimeCondition.fromString(timeValues[1], "hour", idx);
            var dom = TimeCondition_1.TimeCondition.fromString(timeValues[2], "dom", idx);
            var month = TimeCondition_1.TimeCondition.fromString(timeValues[3], "month", idx);
            var dow = TimeCondition_1.TimeCondition.fromString(timeValues[4], "dow", idx);
            return new Job_1.Job({
                minute: minute,
                hour: hour,
                dom: dom,
                month: month,
                dow: dow,
                command: command,
                filepath: filepath,
                criteria: timeValues.join(" "),
                id: idx,
            });
        });
        // Try to update email first
        this.mailTo = email;
        // If successful, proceed:
        this._jobs = jobsRoster;
        (0, utils_1.log)("Chron: Instance updated with new job roster and email.");
    };
    /**  Prints out jobs in an object syntax, showing their respective TimeCondition fields */
    Chron.prototype.printJobs = function () {
        this.jobs.map(function (job, idx) {
            console.log("\nJob ".concat(idx, ": ").concat(JSON.stringify(job, null, 1), "\n"));
        });
    };
    /**  Provides a list of each job, its crontab criteria, and its next scheduled runtime */
    Chron.prototype.printNextRuntimes = function (_a) {
        var _b = _a.criteriaLabels, criteriaLabels = _b === void 0 ? false : _b;
        var jobsLength = this.jobs.length;
        this.jobs.map(function (job, idx) {
            console.log("\n                Job ".concat(idx + 1, "/").concat(jobsLength, " - ID: ").concat(job.id, "\n                Criteria: ").concat(criteriaLabels ? job.criteriaDetailed : job.criteria, "\n                Next Scheduled: ").concat(job.nextRunTime(), "\n                Command: ").concat(job.command, " ").concat(job.filepath, "\n            "));
        });
    };
    return Chron;
}());
exports.Chron = Chron;
