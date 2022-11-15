"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const yaml_1 = __importDefault(require("./utils/yaml"));
const events_1 = require("./utils/events");
class Chassis {
    constructor() {
        this.ctx = null;
        this.app = (0, express_1.default)();
        this.events = new events_1.Events();
        this.boot();
    }
    boot() {
        dotenv_1.default.config();
        // load config from yaml
        const configFile = process.env.GNOMAD_YAML_PATH || "gnomad.yaml";
        const config = (0, yaml_1.default)(configFile);
        // boot app context
        this.ctx = { config, router: this.app, events: this.events };
    }
    install(plugin) {
        if (this.ctx)
            plugin.install(this.ctx);
    }
    start() {
        if (!this.ctx)
            throw new Error("boot failed");
        const brand = this.ctx.config.brand;
        const port = process.env.PORT || 3000;
        // start serving ...
        this.app.listen(port, () => {
            console.log(`chassis.boot '${brand.name}' on port ${port}`);
        });
    }
}
exports.default = Chassis;
