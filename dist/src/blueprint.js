"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const methods = ['get', 'post', 'del', 'put', 'option', 'patch'];
class Blueprint {
    constructor() {
        this.router = {}; // 用于保存路由关系
    }
    setRouter(url, blueprint) {
        const _bp = this.router[url];
        if (_bp) {
            for (let index in _bp) {
                const object = _bp[index];
                if (object.httpMethod === blueprint.httpMethod) {
                    console.log(`路由地址 ${object.httpMethod} ${url} 已经存在`);
                    return;
                }
            }
            this.router[url].push(blueprint);
        }
        else {
            this.router[url] = [];
            this.router[url].push(blueprint);
        }
    }
    restfulClass(url) {
        return (Class) => {
            ['Get', 'Post', 'Put', 'Del'].forEach(httpMethod => {
                const lowercaseMethod = httpMethod.toLowerCase();
                const handler = Class.prototype[httpMethod];
                if (handler) {
                    this.setRouter(url, {
                        httpMethod: lowercaseMethod,
                        constructor: Class,
                        handler: httpMethod
                    });
                }
            });
        };
    }
    get(url) {
        return (target, propertyKey) => {
            this.setRouter(url, {
                httpMethod: 'get',
                constructor: target.constructor,
                handler: propertyKey
            });
        };
    }
    getRoute() {
        return this.router;
    }
}
methods.forEach(httpMethod => {
    Object.defineProperty(Blueprint.prototype, httpMethod, {
        get() {
            return (url) => {
                return (target, propertyKey) => {
                    this.setRouter(url, {
                        httpMethod: 'get',
                        constructor: target.constructor,
                        handler: propertyKey
                    });
                };
            };
        }
    });
});
exports.bp = new Blueprint;
