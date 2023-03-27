import { PDFRender } from "./pdf";
import HBSRenderer from "./hbs";

const debug = require("debug")("gnomad:render:pdf:md")
const fm = require('front-matter-markdown') 
const MarkdownIt = require('markdown-it')
import fs from 'fs'
import path from 'path'

export class PDFMarkdownRender extends PDFRender{
    md: any;
    constructor(options?: Record<string, any>) {
        super(options)
        this.md = new MarkdownIt();
        debug("options: %o", options);
    }

    async load(file: string) {
        let filename = path.join(this.options.render?.path || "./", file)
        debug("load: %o", filename);
        return fs.readFileSync(filename, 'utf8')
    }

    async render(filename: string, ctx: Record<string, any>, pdf_filename: string): Promise<any> {
        const markdown = await this.load(filename);
        const json = fm(markdown);
        debug("render.md: %o ----> %o", markdown, JSON.stringify(json));
        const text = await HBSRenderer.text(json.content, ctx);
        const html = this.md.render(text)
        debug("render.html: %o --> %o", html, ctx);
        return this.generate(html, pdf_filename);
    }
}
