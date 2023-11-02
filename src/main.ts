import { Chron } from "./ChronTab";
import { testSuite } from "./test";

export const debug = false;

const chron = new Chron();
chron.import("./chrontab.txt");

// chron.printJobs()

// testSuite(); // Tests may have fallen out of date as they were calibrated for 11/1/2023

chron.printNextRuntimes({ criteriaLabels: false });
