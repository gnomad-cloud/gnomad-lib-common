"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class Mail {
    constructor(config) {
        this.setup(config);
        this.verifyOrFail();
    }
    setup(config) {
        this.transport = nodemailer_1.default.createTransport({
            pool: true,
            host: config.host || process.env.SMTP_HOST,
            port: config.port || process.env.SMTP_PORT || 465,
            secure: true,
            auth: {
                user: config.user || process.env.SMTP_USER,
                pass: config.pass || process.env.SMTP_PASS,
            },
        });
    }
    verifyOrFail() {
        if (process.env.SMTP_VERIFY == "false")
            return;
        this.transport.verify(function (error, success) {
            if (error) {
                console.log("mail.verify.failed: %j", error);
                throw new Error("gnomad.mail.verify.failed");
            }
        });
    }
    send(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.transport.sendMail(email, (err, done) => {
                    if (err) {
                        let msg = Object.assign(Object.assign({}, email), { error: Object.assign({}, err) });
                        return reject(msg);
                    }
                    let msg = Object.assign(Object.assign({}, email), done);
                    return resolve(msg);
                });
            });
        });
    }
}
exports.default = Mail;
