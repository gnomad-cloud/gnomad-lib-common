"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const generic_1 = __importDefault(require("./plugins/generic"));
const harden_1 = __importDefault(require("./plugins/harden"));
const app = new app_1.default();
if (!app.ctx)
    throw new Error("app not configured");
// register plugins
app.install(new generic_1.default());
app.install(new harden_1.default());
app.start();
