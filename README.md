Specifications:

1. Should port easily into a larger project of the same language
2. No specifically crontab targeted library--Only use standard library tools.
3. Make as a reusable library
4. At least work for the example provided

Take in file of provided format and provide a method to output, for each job, the next date/time with respect to the current. (txt->txt)

(Never seen chrontab system before)

Syntax appears to be:

"\* \* \* \* \*" , minute hour dom month dow, where a number represents a time point, and a slash+number represents a repetition interval, where \*/1 is equivilant to \_, and \*/2 essentially means "skip each second timepoint that matches the time specification"

# Running This Code

1. Install npm
2. Command line `npm install -g typescript`
3. Command line `npx tsc src/main.ts --outDir ./target; node target/main.js` (replace ; with your operating systems command chain syntax, e.g. &&)
4. Command line `node main.js`

(You may need to run PowerShell as administrator, and run `Get-ExecutionPolicy`. If it returns "Restricted", run `Set-ExecutionPolicy RemoteSigned`)

I chose to comment heavily, assuming that the code would need to be comprehensible outside of context (for instance, when used as an imported library).

Being unfamiliar with Chrontabs as a concept, there was some arbitrary naming going on.

I know "more code is not necessarily better"!
