"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
const blueprint_1 = require("./blueprint");
class Loader {
    constructor(app) {
        this.router = new koa_router_1.default;
        this.controller = {};
        this.app = app;
    }
    loadController() {
        const dirs = fs_1.default.readdirSync(__dirname + '/controller');
        dirs.forEach((filename) => {
            require(__dirname + '/controller/' + filename).default;
        });
    }
    loadService() {
        const services = fs_1.default.readdirSync(__dirname + '/service');
        Object.defineProperty(this.app.context, 'service', {
            get() {
                if (!this['cache']) {
                    this['cache'] = {};
                }
                const loaded = this['cache'];
                if (!loaded['service']) {
                    loaded['service'] = {};
                    services.forEach((d) => {
                        const name = d.split('.')[0];
                        const mod = require(__dirname + '/service/' + name).default;
                        loaded['service'][name] = new mod(this, this.app);
                    });
                    return loaded.service;
                }
                return loaded.service;
            }
        });
    }
    loadConfig() {
        const configDef = __dirname + '/config/config.default.js';
        const configEnv = __dirname + (process.env.NODE_ENV === 'production' ? '/config/config.prod.js' : '/config/config.dev.js');
        const conf = require(configEnv);
        const confDef = require(configDef);
        const merge = Object.assign({}, conf, confDef);
        Object.defineProperty(this.app, 'config', {
            get() {
                return merge;
            }
        });
    }
    loadRouter() {
        this.loadController();
        this.loadService();
        this.loadConfig();
        const routes = blueprint_1.bp.getRoute();
        // const mod = require(__dirname + '/router.js')
        // const routers = mod(this.controller)
        Object.keys(routes).forEach(url => {
            routes[url].forEach(item => {
                this.router[item.httpMethod](url, async (ctx) => {
                    const instance = new item.constructor(ctx, this.app);
                    await instance[item.handler]();
                });
            });
            // const [method, path] = key.split(' ');
            // (<any>this.router)[method](path, async (ctx: BaseContext) => {
            //   const _class = routers[key].type;
            //   const handler = routers[key].methodName;
            //   const instance = new _class(ctx, this.app);
            //   instance[handler]();
            // })
        });
        return this.router.routes();
    }
}
exports.Loader = Loader;
