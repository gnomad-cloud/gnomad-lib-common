"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
class GenericAPI {
    constructor() {
    }
    install(ctx) {
        const secret = process.env.SESSION_SECRET || 'secret-squirrel-' + Date.now();
        console.log("session.secret: %s", secret);
        ctx.router.use(require('express-session')({ secret, resave: true, saveUninitialized: true }));
        // app.use(bodyParser.urlencoded({ extended: true }));
        ctx.router.use(body_parser_1.default.json());
        //app.use(bodyParser.raw());
        ctx.router.post("/ce/debug", (req, res, next) => {
            console.log("ce.debug: %j -> %j", req.headers, req.body);
            res.status(200).send({ ok: true });
        });
    }
}
exports.default = GenericAPI;
