import { parse } from 'yaml';
import fs from 'fs';
import Fault from './Fault';
const debug = require("debug")("gnomad:utils:yaml")

export default function(path: string): any {

    // load yaml or abort
    let configFile;
    try {
        debug("file: %s", configFile)
        configFile = fs.readFileSync(path, "utf-8");
    } catch(err) {
        throw new Fault("gnomad:util:yaml:not-found", {path});
    }

    // parse the contents and return our json
    return parse(configFile);
}