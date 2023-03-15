import express, { Application, Express } from 'express';
import yaml from '../utils/yaml';
import { CloudEventBroker, I_Broker, MockEventBroker } from '../events';

export interface I_AppContext {
    config: I_Config;
    router: Application;
    events: I_Broker;
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

    constructor(protected broker?: I_Broker) {
        this.broker = this.broker || new CloudEventBroker();
        this.boot();
    }

    protected boot() {
        // load config from yaml
        const configFile = process.env.GNOMAD_YAML_PATH || "gnomad.yaml"
        const config = yaml(configFile) as I_Config;

        const router: Express = express();
        // boot app context
        this.ctx = { config, router, events: this.broker } as I_AppContext;
    }

    _assert_booted() {
        if (!this.ctx) throw new Error("boot failed");
        return true;
    }

    install(plugin: I_Plugin) {
        this._assert_booted();
        if (this.ctx) plugin.install(this.ctx);
    }

    start() {
        this._assert_booted();
        const port = process.env.PORT || 3000;
        // start serving ...
        this.ctx?.router.listen(port, () => {
            console.log(`chassis.api on port ${port}`);
        });
    }
}