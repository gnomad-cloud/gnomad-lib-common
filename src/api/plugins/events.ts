import { I_AppContext, I_Plugin } from "../app";
import { Request, Response } from "express";
import Fault from "../../utils/Fault";
import { LocalFileStore } from "../../store";
import { I_Broker, ProxyBroker } from "../../events";
import { MockEventBroker } from "../../events/mock";

export default class EventsPlugin implements I_Plugin {

    constructor() {
    }

    install(ctx: I_AppContext): void {
        if (!process.env.CE_BROKER) throw new Fault("gnomad.plugin.event.ce.missing", { ctx } )

        ctx.router.post("/ce", (req: Request, res: Response, next: Function) => {
            console.log("ce.post: %j -> %j", req.headers, req.body);
            ctx.events.fire(req.body || {} )
            res.status(200).send({ ok: true });
          })
    }
}