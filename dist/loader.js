"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
class Loader {
    constructor(app) {
        this.router = new koa_router_1.default;
        this.controller = {};
        this.app = app;
    }
    loadController() {
        const dirs = fs_1.default.readdirSync(__dirname + '/controller');
        dirs.forEach((filename) => {
            const property = filename.split('.')[0];
            const mod = require(__dirname + '/controller/' + filename).default;
            if (mod) {
                const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
                    if (names !== 'constructor') {
                        return names;
                    }
                });
                Object.defineProperty(this.controller, property, {
                    get() {
                        const merge = {};
                        methodNames.forEach((name) => {
                            merge[name] = {
                                type: mod,
                                methodName: name
                            };
                        });
                        return merge;
                    }
                });
            }
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
        const mod = require(__dirname + '/router.js');
        const routers = mod(this.controller);
        Object.keys(routers).forEach(key => {
            const [method, path] = key.split(' ');
            this.router[method](path, async (ctx) => {
                const _class = routers[key].type;
                const handler = routers[key].methodName;
                const instance = new _class(ctx, this.app);
                instance[handler]();
            });
        });
        return this.router.routes();
    }
}
exports.Loader = Loader;
