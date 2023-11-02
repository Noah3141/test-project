import { Chron } from "./ChronTab";

const assertEqual = (calculated: Date, desired: Date, label: string = ""): void => {
    calculated.setSeconds(0, 0);
    desired.setSeconds(0, 0);

    if (calculated.getTime() !== desired.getTime()) {
        throw new Error(
            `❌  Assertion failed for: ${label}. 
            \n     Provided: ${calculated},
            \n     !=
            \n     Desired: ${desired}
            \n\n\r`
        );
    } else {
        console.log(`✅  ${label} passed`);
    }
};

export const testSuite = () => {
    const chron = new Chron();
    chron.import("./chrontab.txt");

    // Test Job 1
    const desired1 = new Date();
    desired1.setMinutes(desired1.getMinutes() + 1);
    const calculated1 = chron.jobs.at(0)?.nextRunTime()!;

    assertEqual(
        calculated1 as Date, // Minutely
        desired1,
        "Job Test 1"
    );

    // Test Job 2
    const desired2 = new Date("2023-11-02T20:01:43-05:00");
    const calculated2 = chron.jobs.at(11)?.nextRunTime()!;

    assertEqual(
        calculated2 as Date, // Minutely
        desired2,
        "Job Test 2"
    );

    // Test Job 3
    const desired3 = new Date("2023-11-02T02:50:27-05:00");
    const calculated3 = chron.jobs.at(16)?.nextRunTime()!;

    assertEqual(
        calculated3 as Date, // Minutely
        desired3,
        "Job Test 3"
    );
};
