"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const loader_1 = require("./loader");
const controller_js_1 = require("./base/controller.js");
const service_js_1 = require("./base/service.js");
const blueprint_1 = require("./blueprint");
const req = __importStar(require("request"));
class Nero extends koa_1.default {
    constructor() {
        super();
        this.config = {};
        this.loader = new loader_1.Loader(this);
        this.port = 3000;
        this.ip = '127.0.0.1';
    }
    // load the default middleware
    loadDefaultMiddleware() {
        const bodyparser = require('koa-bodyparser');
        this.use(bodyparser);
    }
    // the error page
    error() {
        this.use(async (ctx, next) => {
            try {
                await next();
                if (ctx.status === 404) {
                    ctx.body = '<h1>404 not found</h1>';
                    ctx.set('Content-Type', 'text/html');
                }
            }
            catch (e) {
                let status = e.status || 500;
                let message = e.message || '服务器出错啦';
                let err = `
          <h3>${status}</h3>
          <h3>${message}</h3>
        `;
                e.stack.split('\n').forEach((stk, index) => {
                    index !== 0 && (err += `<p>${stk}</p>`);
                });
                ctx.body = err;
                ctx.set('Content-Type', 'text/html');
            }
        });
    }
    // run it in the development environment
    runInDev(handler) {
        if (process.env.NODE_ENV !== 'production') {
            handler.bind(this)();
        }
    }
    // run it in the production environment
    run(fn, port, ip) {
        this.runInDev(this.error);
        this.loadDefaultMiddleware();
        // load the controller service router config and plugins
        this.loader.load();
        return this.listen(port || this.port, ip || this.ip, () => {
            fn && fn(port || this.port, ip || this.ip);
        });
    }
    // quick get a http request
    async curl(url) {
        const c = new Promise((resolve, reject) => {
            req.get(url, undefined, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ error, response, body });
                }
            });
        });
        return await c;
    }
    // quick post a http request
    async post(url, json) {
        const c = new Promise((resolve, reject) => {
            req.post(url, { body: JSON.stringify(json) }, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ error, response, body });
                }
            });
        });
        return await c;
    }
}
Nero.Controller = controller_js_1.Controller;
Nero.Service = service_js_1.Service;
Nero.Blueprint = blueprint_1.bp;
exports.Nero = Nero;
