import * as fs from "fs";
import { Job } from "./Job";

/// Overall ojbect wrapper for the task
export class Chron {
    /// Hide property as private to prevent accidental modification and ensure with setter that modification corresponds to desired "side-effects" (e.g. keeping the file in sync)
    private _mailTo: string; // Here I would bring in Zod to check this as email, not just string
    /// A single row of a chrontab file
    jobs: Job[]; // Depending on use case a hash map of job's ID would be nice here: Map<string,Job>
    /// This instance of Chron's chrontab file
    filepath: string;

    /// Return the current value of `mailTo`
    get mailTo(): string {
        return this._mailTo;
    }
    /// Sets the value of mailTo to the provided email, if valid, updating ...
    set mailTo(email: string) {
        // todo) Validate input string
        const validatedEmail = email;
        // todo) Make sideffects
        this._mailTo = validatedEmail;
    }

    /// Reads provided filepath into instance, saving in filepath property
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
    }

    /// Takes in a chrontab file's text, and updates the instance accordingly. Errors if syntax is invalid. Does not update values if errors on parse
    private parseText(fileText: string): void {
        // Preprocess text
        const lines: string[] = fileText
            .split("\n")
            .filter((line) => !line.startsWith("#")) // Remove comments
            .map((line) => line.replace("\r", "")) // For my readability sake
            .filter((line) => line !== ""); // Remove empty lines

        // Try to build a job out of each line, adding to roster if successful, and stoppiing the Chron update if not
        const jobsRoster: Job[] = lines.map((line, idx) => {
            const lineParts = line.split(" ");

            console.log(lineParts);

            const minute = 999;
            const hour = 999;
            const dom = 999;
            const month = 999;
            const dow = 999;
            const command = "foo";
            const filepath = "bar";

            return new Job({
                minute,
                hour,
                dom,
                month,
                dow,
                command,
                filepath,
            });
        });

        this.jobs = jobsRoster;
    }
}
