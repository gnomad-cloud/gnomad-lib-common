const debug = require('debug')('persona:utils');
import fetch from "node-fetch"

export class Matrix<T> {
    fetcher: Function|undefined;

    constructor(fetcher?: Function) {
        this.fetcher = fetcher || fetch;
    }

    prefixed(inTemplate: string, last: string): any {
        let ix = inTemplate.lastIndexOf(last);
        if (ix<0) return inTemplate;
        return inTemplate.substring(0, ix);
    }

    variations(my: any,  matrix?: any) {
        let scalar: Record<string,any>  = {};
        let vectors: Record<string,any>  = {...matrix};

        // cache the values
        Object.entries(my).forEach(([key, value], index) => {
            if ( Array.isArray(value)) {
                vectors[key] = value;
            } else {
                scalar[key] = value;
            }
        });

        return this.combinations(vectors,scalar)
    }

    combinations(vectors: any, scalar: any) {
        let result = [];
        let keys = Object.keys(vectors);
        debug('combinations: %o', vectors);
        let values = vectors[keys[0]] || [];
        if (values.length==0) return [scalar];

        let rest = vectors[keys[1]] || [];
    
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < rest.length; j++) {
                let newObj: any = {...scalar};
                newObj[keys[0]] = values[i];
                newObj[keys[1]] = rest[j];
                result.push(newObj);
            }
        }
        return result;
    }
    
    async fetch(ctx: Record<string,any>): Promise<Record<string,any>> {
        if (!this.fetcher) return Promise.reject(ctx);
        let keys = Object.keys(ctx);
        for(let i=0; i<keys.length; i++) {
            let key = keys[i];
            if (key.startsWith("@")) {
                const response = await this.fetcher( ctx[key] );
                const data = await response.json();
                ctx[ key.substring(1) ] = data;
            }
        }
        return Promise.resolve(ctx);
    }
}