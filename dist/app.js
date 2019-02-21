"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const app = new koa_1.default;
const route = new koa_router_1.default;
route.get('/', async (ctx, next) => {
    ctx.body = "hello ts-koa";
});
app.use(route.routes());
app.listen(3000, '127.0.0.1', () => {
    console.log('done');
});
//# sourceMappingURL=app.js.map