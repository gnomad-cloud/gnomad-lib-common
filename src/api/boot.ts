import Chassis from "./app";
import GenericAPIPlugin from "./plugins/generic";
import HardenAPIsPlugin from "./plugins/harden";
import EventsPlugin from "./plugins/events";
import { ProxyBroker, MockEventBroker } from "../events";
import { LocalFileStore } from "../store";
import dotenv from 'dotenv';
import path from 'path'

const DOT_ENV_FILE = path.join(process.cwd(),".env."+process.env.NODE_ENV?.trim())
dotenv.config( { path: DOT_ENV_FILE, debug: true })
console.log(".dotenv: %o -> %s", DOT_ENV_FILE, process.env.CE_BROKER)


export default function boot() {
    const store = new LocalFileStore(".local");
    const broker = new ProxyBroker(store, new MockEventBroker())

    const app = new Chassis(broker);
    if (!app.ctx) throw new Error("app not configured");

    // register plugins

    app.install(new GenericAPIPlugin());
    app.install(new HardenAPIsPlugin());
    app.install(new EventsPlugin());

    app.start();

    broker.fire( { id: "self", type: "boot", source: "self", data: {} })
    return { app }
}

boot();