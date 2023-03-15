const debug = require("debug")("gnomad:events:ce")

import { CloudEvent } from "cloudevents";
import { I_CloudEvent, I_Broker } from ".";

export class MockEventBroker implements I_Broker {
    constructor() {
    }

    fire(event: I_CloudEvent): Promise<I_CloudEvent> {
        const { id, type, source, data } = event;
        const ce = new CloudEvent({ id, type, source, data }, true);
        console.log("ce.mock: %o", ce);
        return Promise.resolve( ce )
    }
}