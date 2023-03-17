import { I_AppContext, I_Plugin } from "../app";
import helmet from 'helmet';
import cors from 'cors';
const debug = require("debug")("gnomad:plugin:harden")

export default class ProtectedRoutes implements I_Plugin {

    constructor() {}

    install(ctx: I_AppContext): void {
      ctx.router.use(helmet());
      ctx.router.use(cors());
    }
}