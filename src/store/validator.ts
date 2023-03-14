import { I_Validator, I_Valid, I_Invalid } from "."

export default class Validator implements I_Validator {
    validate(type: string, data: any): Promise<I_Valid|I_Invalid> {
       return Promise.resolve( { valid: true, schema: { id() { return "none" }} } as I_Valid)
    }
}