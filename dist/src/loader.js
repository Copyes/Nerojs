"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
const blueprint_1 = require("./blueprint");
const HASLOADED = Symbol('hasloaded');
// find the sub string
function removeString(source, str) {
    const index = source.indexOf(str);
    if (index > 0) {
        return {
            source: source.substr(0, index),
            isFound: true
        };
    }
    return {
        source,
        isFound: false
    };
}
class Loader {
    constructor(app) {
        this.router = new koa_router_1.default;
        this.controller = {};
        this.app = app;
    }
    loadDir() {
        const subStrObj = removeString(__dirname, 'node_modules');
        if (subStrObj.isFound) {
            return subStrObj.source;
        }
        return subStrObj.source.substr(0, subStrObj.source.length - 4) + '/';
    }
    fileLoader(url) {
        const mergePath = this.loadDir() + url;
        return fs_1.default.readdirSync(mergePath).map((name) => {
            return {
                module: require(mergePath + '/' + name).default,
                filename: name
            };
        });
    }
    loadController() {
        this.fileLoader('app/controller');
    }
    // load the context
    loadContext(targets, app, property) {
        Object.defineProperty(app.context, property, {
            get() {
                if (!this[HASLOADED]) {
                    this[HASLOADED] = {};
                }
                const loaded = this[HASLOADED];
                if (!loaded[property]) {
                    loaded[property] = {};
                    targets.forEach(mod => {
                        const key = mod.filename.split('.')[0];
                        loaded[property][key] = new mod.module(this, app);
                    });
                    return loaded.service;
                }
                return loaded.service;
            }
        });
    }
    loadService() {
        const service = this.fileLoader('app/service');
        this.loadContext(service, this.app, 'service');
    }
    loadConfig() {
        const configDef = this.loadDir() + 'app/config/config.default.js';
        const configEnv = this.loadDir() + (process.env.NODE_ENV === 'production' ? 'app/config/config.prod.js' : 'app/config/config.dev.js');
        const conf = require(configEnv);
        const confDef = require(configDef);
        const merge = Object.assign({}, conf, confDef);
        Object.defineProperty(this.app, 'config', {
            get() {
                return merge;
            }
        });
    }
    // 动态加载插件
    loadPlugin() {
        const pluginDir = this.loadDir() + 'app/plugins/index.js';
        const plugins = require(pluginDir).default;
        for (const index in plugins) {
            const plugin = plugins[index];
            if (plugin.enable) {
                const pkg = require(plugin.package);
                pkg(this.app);
            }
        }
    }
    // load the middlewares
    loadMiddleware() {
        try {
            const middlewares = this.fileLoader('app/middleware');
            const registedMid = this.app.config['middleware'];
            if (!registedMid)
                return;
            registedMid.forEach((name) => {
                for (const index in middlewares) {
                    const mod = middlewares[index];
                    const fname = mod.filename.split('.')[0];
                    name === fname && this.app.use(mod.module());
                }
            });
        }
        catch (e) {
        }
    }
    loadRouter() {
        const routes = blueprint_1.bp.getRoute();
        Object.keys(routes).forEach(url => {
            routes[url].forEach(item => {
                this.router[item.httpMethod](url, async (ctx) => {
                    const instance = new item.constructor(ctx, this.app);
                    await instance[item.handler]();
                });
            });
        });
        this.app.use(this.router.routes());
    }
    load() {
        this.loadConfig();
        this.loadPlugin();
        this.loadMiddleware();
        this.loadController();
        this.loadService();
        this.loadRouter();
    }
}
exports.Loader = Loader;
