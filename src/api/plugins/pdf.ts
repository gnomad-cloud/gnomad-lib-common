import { I_AppContext, I_Plugin } from "../app";
import { Request, Response } from "express";
import Fault from "../../utils/Fault";
import { PDFRender } from "../../render/pdf";
const debug = require("debug")("gnomad:plugin:pdf")
import path from "path";
import { PDFMarkdownRender } from "../../render/pdf-md";

export default class PDFPlugin implements I_Plugin {

    constructor() {
    }

    install(ctx: I_AppContext): void {
        if (!process.env.CE_BROKER) throw new Fault("gnomad.plugin.event.ce.missing", { ctx } )
        const config = (ctx.config as any).pdf; 
        debug("install: %o", config);

        ctx.router.post("/pdf/:template", async (req: Request, res: Response, next: Function) => {
            debug("api: %j -> %j", req.headers, req.body);

            const pdf = new PDFMarkdownRender(config);
            const payload = { my: req.body || {}, meta: {
                headers: req.headers
            } }
            if (req.params.template) {
                const templateFile = req.params.template+".$.md"
                const pdfFile = templateFile+"_"+Date.now()+".pdf";
                try {
                    await pdf.render(templateFile, payload, pdfFile);
                    res.status(200).sendFile(path.join(process.cwd(), pdfFile));
                } catch(e: any) {
                    res.status(500).send( { message: "pdf.fault", error: e.message.toString(), templateFile, pdfFile});
                }
            } else {
                res.status(404).send({ message: "pdf.template.missing", params: req.params});
            }
          })
    }
}