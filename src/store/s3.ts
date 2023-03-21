const debug = require("debug")("gnomad:store:s3")

import { CreateBucketCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { I_Store, I_StoredFile } from ".";
import { AbstractFileStore } from "./abstract";
import path from "path"
import Renderer from "../render/template";
import { I_CloudEvent } from "../events";
import { GenericIdentifier } from "./id/generic";

export interface I_S3Store {
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucket: string
}
export class S3Store<T extends I_CloudEvent> extends AbstractFileStore<T> {
    client: S3;
    config: I_S3Store;
    id: GenericIdentifier;

    constructor(protected _config: I_S3Store, basePath: string) {
        super(basePath)
        this.id = new GenericIdentifier(basePath);
        // connect to S3
        this.config = { 
            endpoint: process.env.S3_ENDPOINT || "", 
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
            region: process.env.S3_REGION || "us-east-1",
            bucket: process.env.S3_BUCKET || basePath
        }
        debug("config: %s -> %o", basePath, this.config);

        this.client = new S3({
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            endpoint: this.config.endpoint,
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey
            }
        });
        if (this.config.bucket) this.mkdir(this.config.bucket)
    }

    // toPath(iri: string, type: string) {
    //     // iri = this.validateIRI(iri);
    //     type = this.resolve(type)
    //     return this.basePath+"/"+
    //         this.resolve(iri)+"/"+
    //         type+"."+this.FILE_TYPE;
    // }

    // resolve(iri: string): string {
    //     let ix = iri.indexOf("://");
    //     if (ix>=0) iri = iri.substring(ix+3);
    //     return Renderer.slugify(iri);
    // }

    async mkdir(folder: string) {
        const bucketParams = { Bucket: folder };
        // console.log("mkdir: %o", folder)
        try {
            const command = new HeadBucketCommand(bucketParams);
            const exists: any = await this.client.send(command);
            // console.log("mkdir.exists: %o --> %o", folder, exists)
            if (exists?.$metadata?.httpStatusCode==200) return Promise.resolve();
            const data = await this.client.send(new CreateBucketCommand(bucketParams));
            // console.log("mkdir.done: %o --> %o", folder, data)
        } catch(err) {
            console.log("mkdir.err: %o --> %o", folder, err)
        }
    }

    async put(filename: string, contents: string, meta?: Record<string, string>) {
        const params = {
            Bucket: this.config.bucket, Key: filename,
            Body: contents, ACL: "private", Metadata: meta || {}
        };
        const data = this.client.send(new PutObjectCommand(params));
        // debug("saved: %s -> %o", filename, await data);
        return data;
    }

    async get(filename: string) {
        const params = {
            Bucket: this.config.bucket, Key: filename,
            ACL: "private"
        };
        const data = await this.client.getObject(params);
        // debug("get: %s --> %o", filename, data.$metadata.httpStatusCode);
        return data || null;
    }

    async save(file: string, contents: T): Promise<I_StoredFile<T>> {
        const data = this.serializer(contents);
        const key = this.fingerprint(data);
        const entity = this.id.tagged(key, contents.type);
        const any = contents as any;
        const meta: any = any.type ? { id: entity, type: any.type, source: any.source } : { type: "gnomad/unknown" };

        debug("save: %s -> %o", entity, meta);
        const saved = await this.put(entity, data, meta)

        const dated = this.id.dated(meta.type)
        const archived = await this.put(dated, data, meta)

        const latest = this.id.tagged(meta.type, "latest")
        const cached = await this.put(latest, data, meta)

        // debug("verified: %s -> %o & %o", filename, verified, cached);
        const done = Promise.resolve(contents);
        return Promise.resolve({ path: entity, data: done, status: 'created' })
    }

    async load(filename: string): Promise<I_StoredFile<T>> {
        const found = await this.get(filename+"."+this.FILE_TYPE);
        if (!found || !found.Body) return Promise.reject(null)
        // debug("load: %s --> %o", filename, found);
        const body = await found.Body.transformToString();
        // debug("get.raw: %s -> %o", filename, JSON.stringify(raw));
        const json = this.materializer(body)
        // debug("get.json: %s -> %o", filename, json);
        const data = Promise.resolve(json);
        return Promise.resolve({ path: filename, data, status: 'active' })
    }

    async delete(filename: string): Promise<I_StoredFile<T>> {
        filename = filename+"."+this.FILE_TYPE;
        // debug("delete: %s", filename);
        const params = {
            Bucket: this.config.bucket, Key: filename,
            ACL: "private"
        };
        const deleted = await this.client.deleteObject(params);
        // debug("deleted: %s", filename, deleted);

        const resolved = Promise.resolve({} as T);
        return Promise.resolve({ path: filename, data: resolved, status: 'deleted' })
    }
}