import fs from 'fs'
import Koa from 'koa'
import Router from 'koa-router'
import { BaseContext } from 'koa'
import { Nero } from './core'
import { bp } from './blueprint'

const HASLOADED = Symbol('hasloaded')

interface StringSub {
  source: string,
  isFound: boolean
}

interface Plugin {
  enable: boolean,
  package: string
}
// find the sub string
function removeString(source: string, str: string): StringSub {
  const index = source.indexOf(str)
  if(index > 0){
    return {
      source: source.substr(0, index),
      isFound: true
    }
  }
  return {
    source,
    isFound: false
  }
}

export class Loader {
  private router: Router = new Router
  private app: Nero
  
  controller: any = {}

  constructor(app: Nero) {
    this.app = app
  }

  private loadDir() {
    const subStrObj = removeString(__dirname, 'node_modules')
    if(subStrObj.isFound){
      return subStrObj.source
    }
    return subStrObj.source.substr(0,subStrObj.source.length - 4) + '/'
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