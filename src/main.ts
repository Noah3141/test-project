import { Chron } from "./ChronTab";

function assertEqual<T>(actual: T, expected: T, message: string = ""): void {
    if (actual !== expected) {
        throw new Error(
            `Assertion failed: ${message}. 
            \n     Provided: ${actual},
            \n     !=
            \n     Expected: ${expected}
            \n\n\r`
        );
    }
}

export const debug = true;

const chron = new Chron();
chron.import("./chrontab.txt");

console.log(`Main: Chron filepath read and set to ${chron.filepath}`);

console.log(chron.jobs[2].nextRunTime());
// chron.printNextJobTimes()

assertEqual(
    chron.jobs.at(0)?.nextRunTime(), // Minutely
    new Date(2023, 11, 1, new Date().getHours(), new Date().getMinutes() + 1),
    "Test 1"
);
