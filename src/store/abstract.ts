const debug = require("debug")("gnomad:store:local")
import path from "path"
//import fs from "fs";
import { createHash } from 'node:crypto'

import { I_Store, I_StoredFile } from ".";

export abstract class AbstractFileStore<T> implements I_Store<T> {
    FILE_TYPE = "json";
    serializer = JSON.stringify
    materializer = JSON.parse

    constructor(protected basePath: string = ".local") {
    }


    fingerprint(content: string) {
        return createHash('sha256').update(content).digest('hex')
    }


    resolve(file: string): string {
        return path.join(this.basePath, file + "." + this.FILE_TYPE);
    }

    find(file: string): Promise<I_StoredFile<T>> {
        return this.load(file);
    }

    abstract save(file: string, contents: T): Promise<I_StoredFile<T>>;

    abstract load(file: string): Promise<I_StoredFile<T>>;

    abstract delete(file: string): Promise<I_StoredFile<T>>;

}