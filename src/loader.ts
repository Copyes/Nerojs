import fs from 'fs';
import Koa from 'koa';
import Router from 'koa-router';
import { BaseContext } from 'koa';


export class Loader {
  router: Router = new Router
  controller: any = {}
  app: Koa

  constructor(app: Koa){
    this.app = app
  }
  loadController(){
    const dirs = fs.readdirSync(__dirname + '/controller');
    dirs.forEach((filename) => {
      const property = filename.split('.')[0];
      const mod = require(__dirname + '/controller/' + filename).default;
      if (mod) {
        const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
            if (names !== 'constructor') {
                return names;
            }
        })
        Object.defineProperty(this.controller, property, {
            get() {
                const merge: { [key: string]: any } = {};
                methodNames.forEach((name) => {
                    merge[name] = {
                        type: mod,
                        methodName: name
                    }
                })
                return merge;
            }
        })
      }
    })
  }
  loadService() {
    const services = fs.readdirSync(__dirname + '/service');
    Object.defineProperty(this.app.context, 'service', {
      get() {
        if(!(<any>this)['cache']){
          (<any>this)['cache'] = {}
        }
        const loaded = (<any>this)['cache'];
        if(!loaded['service']){
          loaded['service'] = {}
          services.forEach((d) => {
            const name = d.split('.')[0];
            const mod = require(__dirname + '/service/' + name).default;
            loaded['service'][name] = new mod(this)
          })
          return loaded.service
        }
        return loaded.service
      }
    })
  }
  loadRouter() {
    this.loadController();
    this.loadService();
    const mod = require(__dirname + '/router.js')
    const routers = mod(this.controller)
    Object.keys(routers).forEach(key => {
      const [method, path] = key.split(' ');
      (<any>this.router)[method](path, async (ctx: BaseContext) => {
        const _class = routers[key].type;
        const handler = routers[key].methodName;
        const instance = new _class(ctx);
        instance[handler]();
      })
    })
    return this.router.routes();
  }
}