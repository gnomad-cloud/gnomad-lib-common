import Renderer from "./template";

const puppeteer = require('puppeteer');
const fs = require('fs');
const debug = require("debug")("gnomad:render:pdf")

export class PDFRender {
    options: Record<string, any>;

    constructor(options?: Record<string, any>) {
        this.options = {
            margin: options?.margin || { top: '100px', right: '50px', bottom: '200px', left: '50px' },
            printBackground: false,
            format: options?.format || 'Legal',
            render: {
                path: options?.path || ".",
                templates: options?.templates || ["./templates/"]
            }
        }
        debug("config: %o --> %o", this.options, options);
    }

    async render(template: string, ctx: Record<string, any>, filename: string): Promise<any> {
        const render = new Renderer( this.options.render );
        const html = await render.template(template, ctx);
        return this.generate(html, filename);
    }

    async generate(html: string, filename: string): Promise<any> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        await page.emulateMediaType('screen');
        debug("generate: %o", { filename });
        const pdf = await page.pdf({
            path: filename,
            ...this.options
        });
        await browser.close();
        return pdf;
    }
}
