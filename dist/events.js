"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const cloudevents_1 = require("cloudevents");
class Events {
    constructor() {
        if (!process.env.CE_BROKER)
            throw new Error("missing CE_BROKER");
        this.emit = (0, cloudevents_1.emitterFor)((0, cloudevents_1.httpTransport)(process.env.CE_BROKER));
    }
    fire(event) {
        const { type, source, data } = event;
        const ce = new cloudevents_1.CloudEvent({ type, source, data });
        console.log("emit: %o", ce);
        this.emit(ce);
    }
}
exports.Events = Events;
