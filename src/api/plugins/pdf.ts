import { I_AppContext, I_Plugin } from "../app";
import { Request, Response } from "express";
import Fault from "../../utils/Fault";
import { LocalFileStore } from "../../store";
import { I_Broker, ProxyBroker } from "../../events";
import { MockEventBroker } from "../../events/mock";
import { PDFRender } from "../../render/pdf";
const debug = require("debug")("gnomad:plugin:pdf")

export default class PDFPlugin implements I_Plugin {

    constructor() {
    }

    install(ctx: I_AppContext): void {
        if (!process.env.CE_BROKER) throw new Fault("gnomad.plugin.event.ce.missing", { ctx } )
        const config = (ctx.config as any).pdf; 
        debug("install: %o", config);

        ctx.router.post("/pdf/:template", async (req: Request, res: Response, next: Function) => {
            debug("api: %j -> %j", req.headers, req.body);

            const pdf = new PDFRender(config);
            const payload = { my: req.body || {}, meta: {
                headers: req.headers
            } }
            if (req.params.template) {
                const template = req.params.template+".$.html"
                const filename = template+"_"+Date.now()+".pdf";
                try {
                    await pdf.render(template, payload, filename);
                    res.status(200).sendFile(filename);
                } catch(e: any) {
                    res.status(500).send( { message: "pdf.fault", error: e.message.toString(), template, filename});
                }
            } else {
                res.status(404).send({ message: "pdf.template.missing", params: req.params});
            }
          })
    }
}