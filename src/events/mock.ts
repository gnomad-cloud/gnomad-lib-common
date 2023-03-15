const debug = require("debug")("gnomad:events:mock")

import { I_CloudEvent, I_Broker } from ".";

export class MockEventBroker implements I_Broker {
    constructor(protected ns: string = "") {
    }

    fire(ce: I_CloudEvent): Promise<I_CloudEvent> {
        debug("fire: %s -> %o", this.ns || "*", ce);
        return Promise.resolve( ce )
    }
}