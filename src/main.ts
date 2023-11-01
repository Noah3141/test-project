import { Chron } from "./ChronTab";

const chron = new Chron();
chron.import("./chrontab.txt");

console.log(`Main: Chron filepath read and set to ${chron.filepath}`);
