const debug = require("debug")("gnomad:events:scoped")

import { I_CloudEvent, I_Broker } from ".";
import { I_Store } from "../store";

export class ScopedEventBroker implements I_Broker {
    proxies: Record<string, I_Broker> = {}

    constructor(protected broker?: I_Broker) {
        if (broker) {
            this.add("*", broker);
        }
    }

    add(name: string, proxy: I_Broker): void {
        name = name || "*";
        this.proxies[name] = proxy;
    }

    async fire(event: I_CloudEvent): Promise<I_CloudEvent> {
        for(let ns in this.proxies) {
            if (ns == "" || ns == "*") {
                this.proxies[ns].fire(event);
                console.log("fire.*: %s -> %s", event.type, event.id)
            } else {
                if (event.type.startsWith(ns)) {
                    this.proxies[ns].fire(event);
                    console.log("fire.type: %s -> %s -> %s", ns, event.type, event.id)
                }
                if (event.id.startsWith(ns)) {
                    this.proxies[ns].fire(event);
                    console.log("fire.id: %s -> %s -> %s", ns, event.type, event.id)
                }
            }
        }
        return Promise.resolve(event);
    }
}