import * as fs from "fs";
import { Job } from "./Job";
import { TimeCondition } from "./TimeCondition";
import { log } from "./utils";

/** Overall ojbect wrapper for the task */
export class Chron {
    /**  Hide property as private to prevent accidental modification and ensure with setter that modification corresponds to desired "side-effects" (e.g. keeping the file in sync) */
    private _mailTo: string; // Here I would bring in Zod to check this as email, not just string
    /** A single row of a chrontab file  */
    private _jobs: Job[]; // Depending on use case a hash map of job's ID would be nice here: Map<string,Job>
    /**  This instance of Chron's chrontab file */
    private filepath: string;

    get jobs(): Job[] {
        return this._jobs;
    }

    /**  Return the current value of `mailTo` */
    get mailTo(): string {
        return this._mailTo;
    }

    /**  Sets the value of mailTo to the provided email, if valid, updating ... */
    set mailTo(email: string) {
        if (!email || !email.includes("@")) {
            console.error(
                `❌  Invalid email fed to Chron. Value not updated. Email parsed from '${this.filepath}' as ${email}`
            );
        } else {
            const validatedEmail = email;
            // todo) Make sideffects

            this._mailTo = validatedEmail;
        }
    }

    /**  Reads provided filepath into instance, saving in filepath property, retrieving email, and setting jobs list to file contents */
    import(filepath: string) {
        // todo) Validate filepath as a filepath

        // Depending on the language, catch error for type. Not sure if this is the preferred typescript pattern for this. Return specific prompt for failure modes
        let fileText = "";
        try {
            fileText = fs.readFileSync(filepath, { encoding: "utf8" });
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log(`File not found at specified path: ${filepath}`);
            } else {
                console.log(`Something went wrong reading specified file path ${filepath}`);
            }
        }
        if (fileText === "") {
            throw new Error(
                "File read succeeded, but text was returned as empty! Chron attributes have not been modified."
            );
        }

        this.parseText(fileText);

        // If no errors, update filepath value
        this.filepath = filepath;
        log("Chron: Instance updated with new filepath.");
    }

    /** Takes in a chrontab file's text, and updates the instance accordingly. Assumes proper syntax. Arbitrarily large number of flags can be passed to command. Does not update values if errors on parse. */
    private parseText(fileText: string): void {
        // Preprocess text
        let email;
        const lines: string[] = fileText
            .split("\n")
            .filter((line) => {
                if (line.startsWith("#MAILTO")) {
                    const quotedText = /"([^"]*)"/g; // "Get me a collection of any number of things that aren't a quote that are between two quotes"
                    email = line.match(quotedText)?.at(0);
                    return false; // remove line
                } else {
                    return !line.startsWith("#");
                }
            }) // Remove comments
            .map((line) => line.replace("\r", "")) // For my readability sake
            .filter((line) => line !== ""); // Remove empty lines

        // Try to build a job out of each line, adding to roster if successful, and stoppiing the Chron update if not
        const jobsRoster: Job[] = lines.map((line, idx) => {
            const lineParts = line.split(/\s+/); // Some people say to never use regex, In this case I think it is a parsimonious way to handle variable spaces due to formatting of input file
            // 7 lines parts corresponds to the basic job listing

            const timeValues = lineParts.slice(0, 5);
            const commandValues = lineParts.slice(5);

            const lastIndex = commandValues.length - 1; // (Not in love with this pattern)
            const filepath = commandValues[lastIndex];
            const command = commandValues.slice(0, lastIndex).join(" ");

            const minute = TimeCondition.fromString(timeValues[0], "minute");
            const hour = TimeCondition.fromString(timeValues[1], "hour");
            const dom = TimeCondition.fromString(timeValues[2], "dom");
            const month = TimeCondition.fromString(timeValues[3], "month");
            const dow = TimeCondition.fromString(timeValues[4], "dow");

            return new Job({
                minute,
                hour,
                dom,
                month,
                dow,
                command,
                filepath,
                criteria: timeValues.join(" "),
                id: idx,
            });
        });

        // Try to update email first
        this.mailTo = email;
        // If successful, proceed:
        this._jobs = jobsRoster;
        log("Chron: Instance updated with new job roster and email.");
    }

    /**  Prints out jobs in an object syntax, showing their respective TimeCondition fields */
    printJobs(): void {
        this.jobs.map((job, idx) => {
            console.log(`\nJob ${idx}: ${JSON.stringify(job, null, 1)}\n`);
        });
    }

    /**  Provides a list of each job, its crontab criteria, and its next scheduled runtime */
    printNextRuntimes({ criteriaLabels = false }: { criteriaLabels: boolean }): void {
        const jobsLength = this.jobs.length;
        this.jobs.map((job, idx) => {
            console.log(`
                Job ${idx + 1}/${jobsLength} - ID: ${job.id}
                Criteria: ${criteriaLabels ? job.criteriaDetailed : job.criteria}
                Next Scheduled: ${job.nextRunTime()}
                Command: ${job.command} ${job.filepath}
            `);
        });
    }
}
