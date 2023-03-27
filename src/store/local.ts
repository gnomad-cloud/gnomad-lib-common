const debug = require("debug")("gnomad:store:local")
import path from "path"
import fs from "fs";
import { mkdirp } from 'mkdirp'

import { I_StoredFile } from ".";
import { AbstractFileStore } from "./abstract";

export class LocalFileStore<T> extends AbstractFileStore<T> {
    FILE_TYPE = "json";
    serializer = JSON.stringify
    materializer = JSON.parse

    constructor(protected basePath: string) {
        super(basePath)
    }

    async save(contents: T): Promise<I_StoredFile<T>> {
        const _entity = contents as any;
        if (!_entity||!_entity.id) return Promise.reject(this);

        const folder = this.resolve(_entity.id);
        const data = this.serializer(contents);
        const key = this.fingerprint(data);
        const filename = path.join(folder, key + "."+this.FILE_TYPE);
        const latest = path.join(folder, "latest."+this.FILE_TYPE);
        debug("save: %s", filename);

        await mkdirp(folder)
        fs.writeFileSync(filename, data);
        fs.writeFileSync(latest, this.serializer({ filename }));

        const loaded = await this.load(filename);
//        debug("saved: %s --> %o", filename, await loaded.data);
        return Promise.resolve({ path: filename, data: loaded.data, status: 'created' })
    }

    meta(file: string): any {
        const folder = this.resolve(file);
        const filename = path.join(folder, "latest."+this.FILE_TYPE);
        debug("meta: %s", filename);
        const latest = fs.readFileSync(filename, "utf-8");
        const meta = this.materializer(latest);
        return meta;
    }

    async load(file: string): Promise<I_StoredFile<T>> {
        const folder = this.resolve(file);
        const meta = this.meta(file);
        debug("load: %s", meta.filename);
        const contents = fs.readFileSync(meta.filename, "utf-8");
        const json = this.materializer(contents);
        const loaded = Promise.resolve(json as T);
        // const data = await loaded;
        return Promise.resolve({ path: meta.filename, data: loaded, status: 'active' })
    }

    async delete(file: string): Promise<I_StoredFile<T>> {
        const filename = this.resolve(file);
        debug("delete: %s", filename);
        fs.rmSync(filename);
        const deleted = Promise.resolve({} as T);
        return Promise.resolve({ path: filename, data: deleted, status: 'deleted' })
    }

}