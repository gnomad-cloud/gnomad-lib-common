
export interface I_StoredFile<T> {
    path: string
    contents: Promise<T>;
    status: "created"  | "active" | "retained" | "deleted"
}
export interface I_Store<T> {

    find(path: string): Promise<I_StoredFile<T>>

    save(path: string, contents: T): Promise<I_StoredFile<T>>

    load(path: string): Promise<I_StoredFile<T>>

    delete(path: string): Promise<I_StoredFile<T>>
}

export class S3Store<T> implements I_Store<T> {

    constructor(
        protected accessKey: string, 
        protected secretKey: string, 
        protected region: string, 
        protected basePath: string) {
            // connect to S3
    }

    find(path: string): Promise<I_StoredFile<T>> {
         console.log("store.find: %s", path);
         const contents = Promise.resolve({} as T);
         return Promise.resolve({ path: path, contents, status: 'active' })
    }

    save(path: string, contents: T): Promise<I_StoredFile<T>> {
        console.log("store.save: %s", path);
        const saved = Promise.resolve(contents);
        return Promise.resolve({ path: path, contents: saved, status: 'created' })
    }

    load(path: string): Promise<I_StoredFile<T>> {
        console.log("store.load: %s", path);
        const contents = Promise.resolve({} as T);
        return Promise.resolve({ path: path, contents, status: 'active' })
    }

    delete(path: string): Promise<I_StoredFile<T>> {
        console.log("store.save: %s", path);
        const resolved = Promise.resolve({} as T);
        return Promise.resolve({ path: path, contents: resolved, status: 'deleted' })
    }

}