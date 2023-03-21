import Renderer from "../../render/template";

export class GenericIdentifier {
    FILE_TYPE: string = "json"

    constructor(protected basePath: string = "") {

    }

    dated(type: string, today: Date = new Date()) {
        const tag = today.getFullYear()+"/"+(today.getMonth()+1)+"/"+today.getDate();
        return this.tagged(type, tag)
    }

    tagged(type: string, tag: string = "latest") {
        return this.basePath+"/"+this.resolve(type)+"/"+tag
    }

    typed(iri: string, type: string) {
        const id = this.resolve(iri); 
        const tag = id.substring(0,2)+"/"+ id+ "."+this.FILE_TYPE;
        return this.tagged(type, tag);
    }

    resolve(iri: string): string {
        let ix = iri.indexOf("://");
        if (ix>=0) iri = iri.substring(ix+3);
        return Renderer.slugify(iri);
    }

}