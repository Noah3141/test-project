import { Chron } from "./ChronTab";
import { testSuite } from "./test";

export const debug = false;

const chron = new Chron();
chron.import("./chrontab.txt");

// chron.printJobs()

testSuite();

chron.printNextRuntimes({ criteriaLabels: false });
