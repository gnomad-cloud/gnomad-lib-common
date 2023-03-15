const debug = require("debug")("gnomad:store:local")
import path from "path"
//import fs from "fs";
import { createHash } from 'node:crypto'

import { I_Store, I_StoredFile } from ".";
import Fault from "../utils/Fault";

export abstract class AbstractFileStore<T> implements I_Store<T> {
    FILE_TYPE = "json";
    serializer = JSON.stringify
    materializer = JSON.parse

    constructor(protected basePath: string = ".local") {
    }


    fingerprint(content: string) {
        return createHash('sha256').update(content).digest('hex')
    }

    validateIRI(iri: string) {
        if (/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(iri))
            return iri;
        throw new Fault("gnomad.store.iri.invalid", { iri })
    }


    resolve(file: string): string {
        file = this.validateIRI(file);
        let ix = file.indexOf("://");
        if (ix>=0) file = file.substring(ix+3);
        // console. log("resolve: %s -> %s", ix, file)
        return path.join(this.basePath, file + "." + this.FILE_TYPE);
    }

    find(file: string): Promise<I_StoredFile<T>> {
        return this.load(file);
    }

    abstract save(file: string, contents: T): Promise<I_StoredFile<T>>;

    abstract load(file: string): Promise<I_StoredFile<T>>;

    abstract delete(file: string): Promise<I_StoredFile<T>>;

}