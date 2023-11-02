## Specifications:

1. Should port easily into a larger project of the same language
2. No specifically crontab targeted library--Only use standard library tools.
3. Make as a reusable library
4. At least work for the example provided

Take in file of provided format and provide a method to output, for each job, the next date/time with respect to the current. (txt->txt)

(Never seen chrontab system before)

Syntax appears to be:

"\* \* \* \* \*" , minute hour dom month dow, where a number represents a time point, and a \*/number represents a repetition interval, where \*/1 is equivilant to \*, and \*/2 essentially means "skip each second timepoint that matches the time specification"

## Running This Code

> 1. Install npm (https://nodejs.org/)
> 2. Command line `node target/main.js`

Developing:

> 2. Command line `npm install -g typescript`
> 3. Command line `npx tsc src/main.ts --outDir ./target; node target/main.js`

(On Windows, you may need to run PowerShell as administrator, and run `Get-ExecutionPolicy`. If it returns "Restricted", run `Set-ExecutionPolicy RemoteSigned`)

`src/main` offers the entry point. `debug` can be set to true to enable other log statements, but this is not set up to be insightful now that it works.

## Decisions

I chose to comment heavily, assuming that the code would need to be comprehensible outside of context (for instance, when used as an imported library).

Being unfamiliar with Chrontabs as a concept, there was some arbitrary naming going on.
I know "more code is not necessarily better"!

I have labeled fields and methods in a redundant manner to make consuming the library easier.

I tried 2 other ways of approaching the actual determination of the next scheduled time. First I tried to do it straight through JS/TS syntax for Date creation:

`new Date(year, month, day, hour, minute)` , where the values are determined through comparing "now" with the next lowest not yet passed possibility which passes the `TimeConditions`. This is a more complex approach than it seems. I also thought of converting everything all over the place into minutes, and doing a kind of matrix multiplication of a minute possibility-schedule across hours/days/months, making a great long array of times, sorting, and picking the next above "now". That has problems too.

I ended up choosing to emphasize checking a _proposed_ time as either valid or not, rather than generate a valid time directly. This meant I had to do a fairly unideal progressive incrementing, where it checks thousands of proposed times until it gets the first valid one. While this brute force method isn't ideal, it is amenable to some optimizations, and can be extended into the alternative solutions that target time proposals. It is mostly slowed down by the presence of implausible or unfortunate time criteria, such as Job 20 (ID:19): "50 1 1-6,8-31 \* 7". The way I've arranged the program allows for the insertion of ways to detect criteria that are likely to push the next scheduled date out very far (such as _both_ an interval for DOM and a value for DOW), and address these combinations in targeted ways.

## Interpretation of chrontab syntax:

10 0 \* \* \* = Any DOM any DOW any month, at the 0th hour and 10th minute

16-32 \* \* \* \* = Every minute from the 17th (0-index) minute to the 32-th minute, any hour, any day etc.

50 1 1-6,8-31 \* 7 = 1:50 AM, 1st to 6th OR 8th to 31st of any month, if it be Sunday
