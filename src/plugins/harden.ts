import { I_AppContext, I_Plugin } from "../api/app";
import helmet from 'helmet';
import cors from 'cors';

export default class ProtectedRoutes implements I_Plugin {

    constructor() {}

    install(ctx: I_AppContext): void {
      ctx.router.use(helmet());
      ctx.router.use(cors());
    }
}