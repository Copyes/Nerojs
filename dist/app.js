"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
// import Router from 'koa-router'
// import { user } from './router/user'
const loader_1 = require("./loader");
const app = new koa_1.default;
// const route = new Router
// route.get('/', user)
app.use(loader_1.loader());
app.listen(3000, '127.0.0.1', () => {
    console.log('done');
});
