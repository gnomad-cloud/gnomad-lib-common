const { I_Templates } = require("./interfaces");
import Handlebars from "handlebars";
import fs from 'fs'
const debug = require('debug')('persona:renderer');

export interface I_Templates {
    path: string;
    templates?: string[];
}

export default class Renderer {
    cached: any = {}
    static idKeyName: string = "id";

    constructor(protected templates: I_Templates) {
        Handlebars.registerHelper("slug", Renderer.slugify);
    }

    public static slugify(text: string): string {
        return text.toLowerCase().replace(/[^a-zA-Z0-9-:_\./]/g, '_');
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
        if (ctx[this.idKeyName])
            ctx[this.idKeyName] = Renderer.slugify(ctx[this.idKeyName]);
    }

    public template(template: string, ctx: any): string {
        if (!this.cached[template]) {
            const path = this.templates.path +"/"+ template;
            const contents = fs.readFileSync(path, 'utf-8');
            this.cached[template] = Handlebars.compile(contents);
        }
        let obj = {...Renderer.defaults(), ...ctx};
        return this.cached[template](obj);
    }

    static defaults() {
        return {
            "now": new Date().toISOString(),
            "today": new Date().toISOString().substring(0, 10),
        }
    }

    public static text(template: string, ctx: any): string {
        const cached = Handlebars.compile(template);
        let obj = {...Renderer.defaults(), ...ctx};
        return cached(obj);
    }
}