import fs from 'fs'
import Router from 'koa-router'
import { BaseContext } from 'koa'
import { Nero } from './core'
import { bp } from './blueprint'

const HASLOADED = Symbol('hasloaded')

interface FileModule {
  module: any,
  filename: string
}
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
  private router: any = new Router
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

  private fileLoader(url: string): Array<FileModule> {
    const mergePath = this.loadDir() + url
    return fs.readdirSync(mergePath).map((name) => {
      return {
        module: require(mergePath + '/' + name).default,
        filename: name
      }
    })
  }

  loadController(){
    this.fileLoader('app/controller')
  }
  // load the context
  loadContext(targets: Array<FileModule>, app: Nero, property: string) {
    Object.defineProperty(app.context, property, {
      get() {
        if(!(<any>this)[HASLOADED]){
          (<any>this)[HASLOADED] = {}
        }
        const loaded = (<any>this)[HASLOADED]
        if(!loaded[property]){
          loaded[property] = {}
          targets.forEach(mod => {
            const key = mod.filename.split('.')[0]
            loaded[property][key] = new mod.module(this, app)
          })
          return loaded.service
        }
        return loaded.service
      }
    })
  }
  loadService() {
    const service = this.fileLoader('app/service')
    this.loadContext(service, this.app, 'service')
  }
  loadConfig() {
    const configDef = this.loadDir() + 'app/config/config.default.js';
    const configEnv = this.loadDir() + (process.env.NODE_ENV === 'production' ? 'app/config/config.prod.js' : 'app/config/config.dev.js');
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
    const pluginDir = this.loadDir() + 'app/plugins/index.js'
    const plugins = require(pluginDir).default

    for(const index in plugins) {
      const plugin: Plugin = plugins[index]
      if(plugin.enable) {
        const pkg = require(plugin.package)
        pkg(this.app)
      }
    }
  }
  // load the middlewares
  loadMiddleware() {
    try {
      const middlewares = this.fileLoader('app/middleware')
      const registedMid = this.app.config['middleware']

      if(!registedMid) return
      registedMid.forEach((name: string) => {
        for(const index in middlewares){
          const mod = middlewares[index]
          const fname = mod.filename.split('.')[0]
          name === fname && this.app.use(mod.module())
        }
      })
    }
    catch(e) {
      
    }
  }
  loadRouter() {
    const routes = bp.getRoute()
    Object.keys(routes).forEach(url => {
      routes[url].forEach(item => {
        this.router[item.httpMethod](url, async (ctx: BaseContext) => {
          const instance = new item.constructor(ctx, this.app)
          await instance[item.handler]()
        })
      })
    })
    this.app.use(this.router.routes())
  }
  load() {
    this.loadConfig()
    this.loadPlugin()
    this.loadMiddleware()
    this.loadController()
    this.loadService()
    this.loadRouter()
  }
}