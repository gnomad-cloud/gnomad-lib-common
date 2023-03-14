const debug = require("debug")("fn:store:local")

import { I_Store, I_StoredFile } from ".";

export class LocalFileStore<T> implements I_Store<T> {

    constructor(protected basePath: string) {
    }

    find(path: string): Promise<I_StoredFile<T>> {
         console.log("store.local.find: %s", path);
         const contents = Promise.resolve({} as T);
         return Promise.resolve({ path: path, contents, status: 'active' })
    }

    save(path: string, contents: T): Promise<I_StoredFile<T>> {
        console.log("store.local.save: %s", path);
        const saved = Promise.resolve(contents);
        return Promise.resolve({ path: path, contents: saved, status: 'created' })
    }

    load(path: string): Promise<I_StoredFile<T>> {
        console.log("store.local.load: %s", path);
        const contents = Promise.resolve({} as T);
        return Promise.resolve({ path: path, contents, status: 'active' })
    }

    delete(path: string): Promise<I_StoredFile<T>> {
        console.log("store.local.save: %s", path);
        const resolved = Promise.resolve({} as T);
        return Promise.resolve({ path: path, contents: resolved, status: 'deleted' })
    }

}