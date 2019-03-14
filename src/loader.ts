import fs from 'fs';
import Koa from 'koa';
import Router from 'koa-router';
import { BaseContext } from 'koa';
import { bp } from './blueprint';


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
      require(__dirname + '/controller/' + filename).default
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
            loaded['service'][name] = new mod(this, this.app)
          })
          return loaded.service
        }
        return loaded.service
      }
    })
  }
  loadConfig() {
    const configDef = __dirname + '/config/config.default.js';
    const configEnv = __dirname + (process.env.NODE_ENV === 'production' ? '/config/config.prod.js' : '/config/config.dev.js');
    const conf = require(configEnv)
    const confDef = require(configDef)
    const merge = Object.assign({}, conf, confDef)
    Object.defineProperty(this.app, 'config', {
      get(){
        return merge
      }
    })
  }

  // 动态加载插件
  loadPlugin() {
    const pluginModule = require(__dirname + '/config/plugin.js')
    Object.keys(pluginModule).forEach(key => {
      if(pluginModule[key].enable){ // 判断是否开启
        const plugin = require(pluginModule[key].packagePath).default
        plugin(this.app)
      }
    })
  }
  
  loadRouter() {
    this.loadController()
    this.loadService()
    this.loadConfig()
    this.loadPlugin()

    const routes = bp.getRoute()
    // const mod = require(__dirname + '/router.js')
    // const routers = mod(this.controller)
    Object.keys(routes).forEach(url => {
      routes[url].forEach(item => {
        (<any>this.router)[item.httpMethod](url, async (ctx: BaseContext) => {
          const instance = new item.constructor(ctx, this.app)
          await instance[item.handler]()
        })
      })
      // const [method, path] = key.split(' ');
      // (<any>this.router)[method](path, async (ctx: BaseContext) => {
      //   const _class = routers[key].type;
      //   const handler = routers[key].methodName;
      //   const instance = new _class(ctx, this.app);
      //   instance[handler]();
      // })
    })
    return this.router.routes();
  }
}