import HBSRenderer from "../../render/hbs";

export class GenericIdentifier {
    FILE_TYPE: string = "json"

    constructor() {

    }

    dated(type: string, key: string, today: Date = new Date()) {
        const tag = today.getFullYear()+"/"+(today.getMonth()+1)+"/"+today.getDate();
        return this.resolve(type)+"/"+tag+"/"+this.resolve(key)
    }

    tagged(type: string, key: string, tag: string = "") {
        return this.resolve(type)+
            (tag?("/"+tag):"")+
            "/"+this.resolve(key)
    }

    key(key: string, type: string) {
        return this.resolve(key)+"/"+this.resolve(type);
    }

    resolve(iri: string): string {
        if (!iri) return "";
        let ix = iri.indexOf("://");
        if (ix>=0) iri = iri.substring(ix+3);
        return HBSRenderer.slugify(iri);
    }

}