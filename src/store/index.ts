
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

export { S3Store } from "./s3";
export { LocalFileStore } from "./local";