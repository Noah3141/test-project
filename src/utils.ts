import { debug } from "./main";

export const log = (msg: string) => {
    if (debug) {
        console.log(`\n${msg}\n`);
    }
};
