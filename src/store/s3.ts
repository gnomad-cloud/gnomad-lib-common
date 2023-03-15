const debug = require("debug")("gnomad:store:s3")

import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { I_Store, I_StoredFile } from ".";
import { AbstractFileStore } from "./abstract";
import path from "path"
import Renderer from "../utils/renderer";
import { I_CloudEvent } from "../events";

export interface I_S3Store {
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucket: string
}
export class S3Store<T extends I_CloudEvent> extends AbstractFileStore<T> {
    client: S3;

    constructor(protected config: I_S3Store, basePath: string) {
        super(basePath)
        debug("config: %s -> %o", basePath, config);
        // connect to S3
        this.client = new S3({
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            endpoint: config.endpoint,
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
        if (config.bucket) this.mkdir(config.bucket)
    }


    resolve(iri: string): string {
        iri = this.validateIRI(iri);
        let ix = iri.indexOf("://");
        if (ix>=0) iri = iri.substring(ix+3);
        return Renderer.slugify(iri);
    }

    async mkdir(folder: string) {
        const bucketParams = { Bucket: folder };
        console.log("mkdir: %o", folder)
        try {
            const command = new HeadBucketCommand(bucketParams);
            const exists: any = await this.client.send(command);
            console.log("mkdir.exists: %o --> %o", folder, exists)
            if (exists?.$metadata?.httpStatusCode==200) return Promise.resolve();
            const data = await this.client.send(new CreateBucketCommand(bucketParams));
            console.log("mkdir.done: %o --> %o", folder, data)
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
        debug("saved: %s -> %o", filename, await data);
        return data;
    }

    toSignaturePath(iri: string, type: string, data: string) {
        const key = this.fingerprint(data);
        type = this.resolve(type)
        return this.basePath+"/"+type+"/"+
            this.resolve(iri)+"/"+
            key+"."+this.FILE_TYPE;
    }

    toLatestPath(iri: string, type: string) {
        type = this.resolve(type)
        return this.basePath+"/"+type+"/"+
            this.resolve(iri)+"/"+
            "latest."+this.FILE_TYPE;
    }

    async save(file: string, contents: T): Promise<I_StoredFile<T>> {
        const data = this.serializer(contents);
        const filename = this.toSignaturePath(file, contents.type, data);
        const latest = this.toLatestPath(file, contents.type)
        debug("save: %s", latest, filename);
 
        const any = contents as any;
        const meta: any = any.type ? { id: filename, type: any.type, source: any.source } : { type: "gnomad/unknown" };

        const verified = await this.put(filename, data, meta)
        const cached = await this.put(latest, data, meta)
        debug("verified: %s -> %o & %o", filename, verified, cached);
        const saved = Promise.resolve(contents);
        return Promise.resolve({ path: filename, data: saved, status: 'created' })
    }

    async load(path: string): Promise<I_StoredFile<T>> {
        debug("load: %s", path);
        const data = Promise.resolve({} as T);
        return Promise.resolve({ path: path, data, status: 'active' })
    }

    async delete(path: string): Promise<I_StoredFile<T>> {
        debug("save: %s", path);
        const resolved = Promise.resolve({} as T);
        return Promise.resolve({ path: path, data: resolved, status: 'deleted' })
    }
}