const debug = require("debug")("gnomad:store:s3")

import { I_Store, I_StoredFile } from ".";
import { AbstractFileStore } from "./abstract";

export class S3Store<T> extends AbstractFileStore<T> {

    constructor(
        protected accessKey: string, 
        protected secretKey: string, 
        protected region: string, 
        protected basePath: string) {
            super(basePath)
            // connect to S3
    }

    save(path: string, data: T): Promise<I_StoredFile<T>> {
        console.log("store.s3.save: %s", path);
        const saved = Promise.resolve(data);
        return Promise.resolve({ path: path, data: saved, status: 'created' })
    }

    load(path: string): Promise<I_StoredFile<T>> {
        console.log("store.s3.load: %s", path);
        const data = Promise.resolve({} as T);
        return Promise.resolve({ path: path, data, status: 'active' })
    }

    delete(path: string): Promise<I_StoredFile<T>> {
        console.log("store.s3.save: %s", path);
        const resolved = Promise.resolve({} as T);
        return Promise.resolve({ path: path, data: resolved, status: 'deleted' })
    }
}