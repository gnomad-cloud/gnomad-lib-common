import Renderer from "./template";

const puppeteer = require('puppeteer');
const fs = require('fs');

export class PDFRender {
    options;

    constructor(options?: Record<string, any>) {
        this.options = {
            margin: { top: '100px', right: '50px', bottom: '200px', left: '50px' },
            printBackground: false,
            format: 'Legal',
            render: {
                path: ".",
                templates: ["./templates/"]
            },
            ...options
        }
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
        const pdf = await page.pdf({
            path: filename,
            ...this.options
        });
        await browser.close();
        return pdf;
    }
}
