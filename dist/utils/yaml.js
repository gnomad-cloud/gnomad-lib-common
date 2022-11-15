"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const fs_1 = __importDefault(require("fs"));
function default_1(path) {
    // load yaml or abort
    let configFile;
    try {
        configFile = fs_1.default.readFileSync(path, "utf-8");
    }
    catch (err) {
        throw new Error("util:yaml:not-found:" + path);
    }
    // parse the contents and return our json
    return (0, yaml_1.parse)(configFile);
}
exports.default = default_1;
