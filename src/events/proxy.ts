const debug = require("debug")("fn:events:broker")

import { I_CloudEvent, I_Broker } from ".";
import { I_Store } from "../store";

export class ProxyBroker implements I_Broker {
    
    constructor(protected store: I_Store<any>, protected proxy: I_Broker) {
        // initialized
    }

    async fire(event: I_CloudEvent): Promise<unknown> {
        await this.store.save( event.id, event )
        return this.proxy.fire(event);
    }
}