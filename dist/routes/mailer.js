"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MailerRoutes {
    constructor(config) {
        this.config = config;
    }
    routes(router) {
        // does nothing yet
        const templates = this.config.templates || "./cms/email/";
        console.log("mailer.templates: %s", templates);
        router.post("/mail/:template/", (req, res, next) => {
            const contacts = req.json || req.body || [];
            if (!Array.isArray(contacts)) {
                return res.status(400).send({ message: "mailer.contacts.invalid", contacts: contacts });
            }
            // read email template
            // query group contacts
            // send email for each contact
            res.send({ template: req.params.template });
        });
    }
}
exports.default = MailerRoutes;
