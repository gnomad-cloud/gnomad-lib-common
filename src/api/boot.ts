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
const CE_BROKER_NS = "https://coded.claims"

export default async function boot() {
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
    brokers.add(CE_BROKER_NS+"#", new MockEventBroker(CE_BROKER_NS+"#"))
    const broker = new ProxyBroker(store, brokers)

    const app = new Chassis(broker);
    if (!app.ctx) throw new Error("app not configured");

    // register plugins

    app.install(new GenericAPIPlugin());
    app.install(new HardenAPIsPlugin());
    app.install(new EventsPlugin());

    app.start();

    const fired = await broker.fire( { id: CE_BROKER_NS+"/booted", type: CE_BROKER_NS+"#boot", source: "https://gnomad.local/self", data: { hello: 'world' } });
    console.log("event.fired: %o", fired);

    const loaded = await store.load("cloud-events/67e64ace461d83cfae956b829b9ca44824f9bfc30c5a27ef47b96d6d51c6ae90/coded-claims-boot")
    console.log("event.reloaded: %o", await loaded.data);
    const deleted = await store.delete("cloud-events/coded-claims-boot/coded-claims-booted/67e64ace461d83cfae956b829b9ca44824f9bfc30c5a27ef47b96d6d51c6ae90")
    console.log("event.deleted: %o", await deleted.data);
    return { app }
}

boot();