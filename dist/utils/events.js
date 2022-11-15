"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const cloudevents_1 = require("cloudevents");
class Events {
    constructor() {
        let CE_BROKER = process.env.CE_BROKER;
        if (process.env.NODE_ENV == 'development')
            CE_BROKER = CE_BROKER || "http://localhost:3000/ce/debug";
        if (!CE_BROKER)
            throw new Error("missing CE_BROKER");
        console.log("ce.broker: %s", CE_BROKER);
        this.emit = (0, cloudevents_1.emitterFor)((0, cloudevents_1.httpTransport)(CE_BROKER));
    }
    fire(event) {
        const { type, source, data } = event;
        const ce = new cloudevents_1.CloudEvent({ type, source, data });
        console.log("ce.emit: %o", ce);
        this.emit(ce);
    }
}
exports.Events = Events;
