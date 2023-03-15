import Chassis from "./app";
import GenericAPIPlugin from "./plugins/generic";
import HardenAPIsPlugin from "./plugins/harden";
import EventsPlugin from "./plugins/events";
import { ProxyBroker, MockEventBroker, I_CloudEvent } from "../events";
import { LocalFileStore, S3Store } from "../store";
import dotenv from 'dotenv';
import path from 'path'
import { I_S3Store } from "../store/s3";
import { ScopedEventBroker } from "../events/scoped";

const DOT_ENV_FILE = path.join(process.cwd(),".env."+process.env.NODE_ENV?.trim())
dotenv.config( { path: DOT_ENV_FILE, debug: true })
console.log(".dotenv: %o -> %s", DOT_ENV_FILE, process.env.CE_BROKER)

const S3_FOLDER = (process.env.S3_FOLDER || process.env.NODE_ENV || ".gnomad").toLowerCase();

export default function boot() {
    let config: I_S3Store = { 
        endpoint: process.env.S3_ENDPOINT || "", 
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        region: process.env.S3_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET || S3_FOLDER
    }
    const store = new S3Store<I_CloudEvent>(config, S3_FOLDER);
    // new LocalFileStore(".local");
    const brokers = new ScopedEventBroker(new MockEventBroker());
    brokers.add("https://coded.claims#", new MockEventBroker("https://coded.claims#"))
    const broker = new ProxyBroker(store, brokers)

    const app = new Chassis(broker);
    if (!app.ctx) throw new Error("app not configured");

    // register plugins

    app.install(new GenericAPIPlugin());
    app.install(new HardenAPIsPlugin());
    app.install(new EventsPlugin());

    app.start();

    broker.fire( { id: "https://coded.claims/booted", type: "https://coded.claims#boot", source: "self", data: { hello: 'world' } })
    return { app }
}

boot();