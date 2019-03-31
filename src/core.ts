import Koa from 'koa'
import { Loader } from './loader'
import { Controller } from './base/controller.js'
import { Service } from './base/service.js'
import { blueprint, bp } from './blueprint'

import * as req from 'request'

export class Nero extends Koa {
  private loader: Loader
  private port: number
  private ip: string

  static Controller: typeof Controller = Controller
  static Service: typeof Service = Service
  static Blueprint: blueprint = bp

  config: any = {}

  constructor(){
    super()
    this.loader = new Loader(this)
    this.port = 3000
    this.ip = '127.0.0.1'
  }
  // load the default middleware
  loadDefaultMiddleware() {
    const bodyparser = require('koa-bodyparser')
    this.use(bodyparser())
  }
  // the error page
  error() {
    this.use(async (ctx, next) => {
      try {
        await next()
        if(ctx.status === 404) {
          ctx.body = '<h1>404 not found</h1>'
          ctx.set('Content-Type', 'text/html')
        }
      } catch(e) {
        let status = e.status || 500
        let message = e.message || '服务器出错啦'
        let err = `
          <h3>${status}</h3>
          <h3>${message}</h3>
        `
        e.stack.split('\n').forEach((stk: string, index: number) => {
          index !== 0 && (err += `<p>${stk}</p>`)
        })

        ctx.body = err
        ctx.set('Content-Type', 'text/html')
      }
    })
  }
  // run it in the development environment
  runInDev(handler: Function) {
    if(process.env.NODE_ENV !== 'production'){
      handler.bind(this)()
    }
  }
  // run it in the production environment
  run(fn: (port: number, ip: string) => void, port?: number, ip?: string) {
    this.runInDev(this.error)
    this.loadDefaultMiddleware()
    // load the controller service router config and plugins
    this.loader.load()

    return this.listen(port || this.port, ip || this.ip, () => {
      fn && fn(port || this.port, ip || this.ip)
    })
  }
  // quick get a http request
  async curl(url: string) {
    const c = new Promise((resolve, reject) => {
      req.get(url, undefined, (error: any, response: any, body: any) => {
        if(error){
          reject(error)
        } else {
          resolve({error, response, body})
        }
      })
    })
    return await c
  }
  // quick post a http request
  async post(url: string, json: object) {
    const c = new Promise((resolve, reject) => {
      req.post(url, {body: JSON.stringify(json)}, (error: any, response: any, body: any) => {
        if(error){
          reject(error)
        } else {
          resolve({error, response, body})
        }
      })
    })
    return await c
  }
}