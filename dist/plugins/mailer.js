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
const local_template_store_1 = require("../store/local-template-store");
const handlebars_1 = __importDefault(require("handlebars"));
const mail_1 = __importDefault(require("../utils/mail"));
class MailerRoutes {
    constructor(config, smtp) {
        this.config = config;
        const templates = config.templates || "./cms/email/templates/";
        this.templates = new local_template_store_1.LocalTemplateStore(templates);
        this.emailer = new mail_1.default(smtp);
    }
    install(ctx) {
        const router = ctx.router;
        this.brand = ctx.config.brand || { name: "gnomad.mailer" };
        // indirectly send a template email to group of contacts
        router.post("/mail/bulk/:template", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const contacts = req.json || req.body || [];
            if (!Array.isArray(contacts)) {
                return res.status(400).send({ message: "mailer.contacts.invalid", contacts: contacts });
            }
            const template = this.templates.getTemplate(req.params.template);
            res.send({ status: 'gnomad.mail.bulk', count: contacts.length, subject: template.subject });
            this.emitBatchEmailEvents(ctx.events, template, contacts);
        }));
        // cloud-event to send an single email to a single recipient
        router.post("/ce/mail/send", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const msg = req.json || req.body || null;
            // send via SMTP / nodemailer
            this.emailer.send(msg).then((sent) => {
                console.log("mail.sent: %j", sent);
                res.send({ status: 'gnomad.mail.sent', data: sent });
            }).catch(failed => {
                console.log("mail.failed: %j", failed);
                res.send({ status: 'gnomad.mail.failed', data: failed });
            });
        }));
    }
    emitBatchEmailEvents(events, template, contacts) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = handlebars_1.default.compile(template.subject);
            const html = handlebars_1.default.compile(template.html);
            const text = handlebars_1.default.compile(template.text);
            let i = 0;
            contacts.forEach(contact => {
                contact.id = contact.id || 'i_' + (++i);
                const ctx = { my: contact, now: new Date().toISOString(), brand: this.brand };
                let defaults = this.config.default || {};
                // instantiate our email message
                const email = Object.assign(Object.assign({}, defaults), { id: template.id + "/" + contact.id, subject: subject(ctx), text: text(ctx), html: html(ctx), from: template.from || defaults.from, to: contact.email });
                let temp = template;
                if (temp.attachments)
                    email.attachments = temp.attachments || [];
                // fire 'send email' event 
                events.fire({ type: "gnomad.mail.send", source: contact.id, data: email });
            });
        });
    }
}
exports.default = MailerRoutes;
