"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSubscriptionStore = void 0;
const fs_1 = require("fs");
const yaml_1 = __importDefault(require("../utils/yaml"));
class LocalSubscriptionStore {
    constructor(path) {
        this.path = path;
        (0, fs_1.mkdirSync)(this.path);
        (0, fs_1.mkdirSync)(this.path + "/subscription/");
        (0, fs_1.mkdirSync)(this.path + "/publication/");
    }
    getPublication(name) {
        const path = this.path + "/publication/" + name + ".yaml";
        return (0, yaml_1.default)(path);
    }
    getSubscription(name, contact) {
        const publication = this.getPublication(name);
        const path = this.path + "/subscription/" + name + "/" + contact.id + ".yaml";
        const subscription = (0, yaml_1.default)(path);
        subscription.index = subscription.index || 0;
        if (subscription.index < publication.mail.length) {
            const mail = publication.mail[subscription.index++];
        }
        return subscription;
    }
}
exports.LocalSubscriptionStore = LocalSubscriptionStore;
