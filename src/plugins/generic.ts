import { I_AppContext, I_Plugin } from "../api/app";
import bodyParser from 'body-parser';
import { Request, Response } from "express";

export default class GenericAPI implements I_Plugin {

    constructor() {
    }

    install(ctx: I_AppContext): void {
        const secret = process.env.SESSION_SECRET || 'secret-squirrel-' + Date.now();
        console.log("session.secret: %s", secret);
        ctx.router.use(require('express-session')({ secret, resave: true, saveUninitialized: true }));

        // app.use(bodyParser.urlencoded({ extended: true }));
        ctx.router.use(bodyParser.json());
        //app.use(bodyParser.raw());

        ctx.router.post("/ce/debug", (req: Request, res: Response, next: Function) => {
            console.log("ce.debug: %j -> %j", req.headers, req.body);
            res.status(200).send({ ok: true });
          })
    }
}