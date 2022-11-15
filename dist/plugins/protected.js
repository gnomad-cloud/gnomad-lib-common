"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
class ProtectedRoutes {
    constructor() { }
    install(ctx) {
        ctx.router.use((0, helmet_1.default)());
        ctx.router.use((0, cors_1.default)());
    }
}
exports.default = ProtectedRoutes;
