export interface I_StoredFile<T> {
    path: string
    data: Promise<T>;
    status: "created"  | "active" | "retained" | "deleted"
}

export interface I_Store<T> {

    find(path: string): Promise<I_StoredFile<T>>

    save(path: string, contents: T): Promise<I_StoredFile<T>>

    load(path: string): Promise<I_StoredFile<T>>

    delete(path: string): Promise<I_StoredFile<T>>
}

export interface I_Schema {
    id(): string;
}

export interface I_SchemaRegistry {
    get(id: string): I_Schema;
}

export interface I_Valid {
    valid: boolean;
    schema: I_Schema;
}

export interface I_Invalid extends I_Valid {
    errors: any;
}

export interface I_Validator {
    validate(type: string, data: any): Promise<I_Valid|I_Invalid>
}

export { S3Store } from "./s3";

export { LocalFileStore } from "./local";