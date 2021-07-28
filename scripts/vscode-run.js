const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

const args = yargs(hideBin(process.argv)).argv;
const cwd = process.cwd();

const resolvePlugin = function (dir) {
    return dir
        .replace(cwd, "")
        .replace(/^(\\|\/)/, "")
        .split("\\")
        .shift();
};

const plugin = resolvePlugin(args.file);

const pluginPath = path.resolve(cwd, plugin);
if (fs.existsSync(pluginPath) && fs.existsSync(path.resolve(pluginPath, "package.json"))) {
    const builderArgs = args.builderArgs ?
        args.builderArgs
            .split(/\s?,\s?/)
            .map(e => "--" + e)
            .join(" ")
        : "";
    cp.exec(`npm run dev -- --plugin="${plugin}" ${builderArgs}`, error => {
        if (error) {
            throw new Error("Command has failed!\n" + error);
        }
    });
} else {
    throw new Error("Cannot resolve plugin:" + plugin);
}