import Handlebars from "handlebars";
import fs from 'fs'
const debug = require('debug')('gnomad:render:template');
import path from 'path'
import { I_Renderer, I_Templates } from ".";


export default class HBSRenderer implements I_Renderer {
    cached: any = {}
    static idKeyName: string = "id";

    constructor(protected templates: I_Templates) {
        Handlebars.registerHelper("slug", HBSRenderer.slugify);
    }

    public static slugify(text: string): string {
        return text.toLowerCase().replace(/\W/g, '-')
    }

    public static nolines(text: string): string {
        return text.replace(/(\r\n|\n|\r)/gm, "");
    }

    public static interpolate(ctx: any): void {
        Object.keys(ctx).forEach((key) => {
            if (typeof ctx[key] === "string") {
                ctx[key] = HBSRenderer.text(ctx[key], { my: ctx });
            }
        });

        // special handling of 'id' key - ensure it's a slug
        if (this.idKeyName && ctx[this.idKeyName])
            ctx[this.idKeyName] = HBSRenderer.slugify(ctx[this.idKeyName]);
    }

    public cache(template: string): Function {
        if (this.cached[template]) return this.cached[template]
        const filename = path.join(this.templates.path, template);
        debug("cache: %o", { template, filename, path: this.templates.path });
        const contents = fs.readFileSync(filename, 'utf-8');
        return this.cached[template] = Handlebars.compile(contents);
    }

    public template(template: string, ctx: Record<string,any>): string {
        const compiled = this.cache(template);
        debug("template: %o", { template, ctx });
        return compiled(ctx);
    }

    static defaults() {
        return {
            "now": new Date().toISOString(),
            "today": new Date().toISOString().substring(0, 10),
        }
    }

    public static text(template: string, ctx: any): string {
        const compiled = Handlebars.compile(template);
        let obj = {...HBSRenderer.defaults(), ...ctx};
        return compiled(obj);
    }
}