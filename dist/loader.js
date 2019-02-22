"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
const route = new koa_router_1.default;
function loader() {
    const dirs = fs_1.default.readdirSync(__dirname + '/router');
    console.log(dirs);
    dirs.forEach((filename) => {
        const mod = require(__dirname + '/router/' + filename).default;
        console.log(mod);
        Object.keys(mod).map((key) => {
            const [method, path] = key.split(' ');
            const handler = mod[key];
            route[method](path, handler);
        });
    });
    return route.routes();
}
exports.loader = loader;
