import { I_Templates } from ".";

const debug = require("debug")("gnomad:render:pdf:md")
const fm = require('front-matter-markdown') 
const MarkdownIt = require('markdown-it')
import fs from 'fs'
import path from 'path'
import HBSRenderer from "./hbs";

export class MarkdownRender extends HBSRenderer {
    md: any;
    constructor(options: Record<string, any>, protected templates: I_Templates) {
        super(templates)
        this.md = new MarkdownIt();
        debug("options: %o", options);
    }

    async load(file: string) {
        let filename = path.join(file)
        debug("load: %o", filename);
        return fs.readFileSync(filename, 'utf8')
    }

    async markdown(filename: string, ctx: Record<string, any>): Promise<any> {
        const markdown = await this.load(filename);
        const json = fm(markdown); // content front-matter
        let context = { ...json, ...ctx} // runtime takes precedence
        return this.render(json.content as string, context);
    }

    render(template: string, ctx: Record<string, any>): string {
        const markdown = HBSRenderer.text(template, ctx);
        const html = this.md.render(markdown)
        debug("render.html: %o --> %o", html, ctx);
        return this.template(html, ctx);
    }
}
