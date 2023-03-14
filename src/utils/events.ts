import { httpTransport, emitterFor, CloudEvent } from "cloudevents";
import { UnknownObject } from "express-handlebars/types";

export interface I_CloudEvent {
    type: string;
    source: string;
    id: string;
    data: any;
}

export interface I_Events {
    fire(event: I_CloudEvent): Promise<unknown>
}

export class Events implements I_Events {
    emit: Function;

    constructor() {
        let CE_BROKER = process.env.CE_BROKER;
        if (process.env.NODE_ENV=='development') CE_BROKER = CE_BROKER || "http://localhost:3000/ce/debug"; 

        if (!CE_BROKER) throw new Error("missing CE_BROKER");

        console.log("ce.broker: %s", CE_BROKER)

        this.emit = emitterFor(httpTransport(CE_BROKER as string));
    }

    fire(event: I_CloudEvent): Promise<unknown> {
        const { id, type, source, data } = event;
        const ce = new CloudEvent({ id, type, source, data }, true);
        console.log("ce.emit: %o", ce);
        return this.emit(ce);
    }
}