const debug = require("debug")("fn:store:local")
import path from "path"
import fs from "fs";

import { I_Store, I_StoredFile } from ".";
import { AbstractFileStore } from "./abstract";

export class LocalFileStore<T> extends AbstractFileStore<T> {
    FILE_TYPE = "json";
    serializer = JSON.stringify
    materializer = JSON.parse

    constructor(protected basePath: string) {
        super(basePath)
    }

    resolve(file: string): string {
        const filename = path.join(this.basePath, file + "." + this.FILE_TYPE);
        return filename;
    }

    save(file: string, contents: T): Promise<I_StoredFile<T>> {
        const filename = this.resolve(file);
        console.log("store.local.save: %s", filename);
        const folder = path.dirname(filename);
        fs.mkdirSync(folder);
        const data = this.serializer(contents);
        fs.writeFileSync(filename, data);
        console.log("store.local.saved: %s", filename);
        const saved = Promise.resolve(data as T);
        return Promise.resolve({ path: filename, data: saved, status: 'created' })
    }

    load(file: string): Promise<I_StoredFile<T>> {
        const filename = this.resolve(file);
        console.log("store.local.load: %s", filename);
        const contents = fs.readFileSync(filename, "utf-8");
        const json = this.materializer(contents);
        const loaded = Promise.resolve(json as T);
        return Promise.resolve({ path: filename, data: loaded, status: 'active' })
    }

    delete(file: string): Promise<I_StoredFile<T>> {
        const filename = this.resolve(file);
        console.log("store.local.delete: %s", filename);
        fs.rmSync(filename);
        const deleted = Promise.resolve({} as T);
        return Promise.resolve({ path: filename, data: deleted, status: 'deleted' })
    }

}