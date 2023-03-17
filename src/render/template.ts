import Handlebars from "handlebars";
import fs from 'fs'
const debug = require('debug')('gnomad:render:template');
import path from 'path'

export interface I_Templates {
    path: string;
    templates?: string[];
}

export interface I_MyContext {
    my: any;
    meta: any;
    env: any;
}

export default class Renderer<T> {
    cached: any = {}
    static idKeyName: string = "id";

    constructor(protected templates: I_Templates) {
        Handlebars.registerHelper("slug", Renderer.slugify);
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
                ctx[key] = Renderer.text(ctx[key], { my: ctx });
            }
        });

        // special handling of 'id' key - ensure it's a slug
        if (this.idKeyName && ctx[this.idKeyName])
            ctx[this.idKeyName] = Renderer.slugify(ctx[this.idKeyName]);
    }

    public cache(template: string): Function {
        if (this.cached[template]) return this.cached[template]
        const filename = path.join(this.templates.path, template);
        debug("cache: %o", { template, filename, path: this.templates.path });
        const contents = fs.readFileSync(filename, 'utf-8');
        return this.cached[template] = Handlebars.compile(contents);
    }

    public template(template: string, ctx: any): string {
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
        let obj = {...Renderer.defaults(), ...ctx};
        return compiled(obj);
    }
}