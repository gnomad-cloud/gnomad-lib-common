export default class Fault extends Error {

    constructor(protected iri: string, protected ctx: any) {
        super(iri);
    }
}