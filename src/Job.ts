export class Job {
    minute: number | Range | null;
    hour: number | Range | null;
    /// Day of month
    dom: number | Range | null;
    month: number | Range | null;
    /// Day of week
    dow: number | Range | null;
    command: string;
    filepath: string;

    constructor({ minute, hour, dom, month, dow, command, filepath }: JobParams) {
        this.minute = minute;
        this.dom = dom;
        this.hour = hour;
        this.month = month;
        this.dow = dow;
        this.command = command;
        this.filepath = filepath;
    }
}

// Not actually decoupled from class' declarations
type JobParams = {
    minute: number | Range | null;
    hour: number | Range | null;
    /// Day of month
    dom: number | Range | null;
    month: number | Range | null;
    /// Day of week
    dow: number | Range | null;
    command: string;
    filepath: string;
};

type Range = {
    min: number;
    max: number;
};
