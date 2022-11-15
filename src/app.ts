import express, { Express } from 'express';
import dotenv from 'dotenv';
import yaml from './utils/yaml';
import { I_Events, Events } from './utils/events';

import { Router } from "express";

export interface I_AppContext {
    config: I_Config;
    router: Router;
    events: I_Events;
}

export interface I_Plugin {

    install(ctx: I_AppContext): void;
}

export interface I_Config {
    brand: {
        name: string
    }
    path: string
}

export default class Chassis {
    ctx: I_AppContext | null = null;
    app: Express = express();
    events = new Events();

    constructor() {
        this.boot();
    }

    protected boot() {
        dotenv.config();

        // load config from yaml
        const configFile = process.env.GNOMAD_YAML_PATH || "gnomad.yaml"
        const config = yaml(configFile) as I_Config;

        // boot app context
        this.ctx = { config, router: this.app, events: this.events } as I_AppContext;
    }

    install(plugin: I_Plugin) {
        if (this.ctx) plugin.install(this.ctx);
    }

    start() {
        if (!this.ctx) throw new Error("boot failed");

        const brand = this.ctx.config.brand;
        const port = process.env.PORT || 3000;

        // start serving ...
        this.app.listen(port, () => {
            console.log(`chassis.boot '${brand.name}' on port ${port}`);
        });
    }
}