import { I_CloudEvent, I_Events } from "./events";
import { I_Store } from "../store";

export class Broker implements I_Events {
    
    constructor(protected store: I_Store<any>, protected proxy: I_Events) {
        // initialized
    }

    async fire(event: I_CloudEvent): Promise<unknown> {
        await this.store.save( event.id, event )
        return this.proxy.fire(event);
    }
}