"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalTemplateStore = void 0;
const yaml_1 = __importDefault(require("../utils/yaml"));
class LocalTemplateStore {
    constructor(path) {
        this.path = path;
    }
    getTemplate(name) {
        const path = this.path + "/" + name + ".yaml";
        let template = (0, yaml_1.default)(path);
        template.id = template.id || name;
        return template;
    }
}
exports.LocalTemplateStore = LocalTemplateStore;
