import { BaseContext } from 'koa'
import { Nero } from '../core'
export class Service {
  ctx: BaseContext
  app: Nero
  constructor(ctx: BaseContext){
    this.ctx = ctx
    this.app = ctx.app
  }
}