import { BaseContext } from 'koa'
import { Nero } from '../core'
export class Controller {
  ctx: BaseContext
  app: Nero
  constructor(ctx: BaseContext){
    this.ctx = ctx
    this.app = ctx.app
  }
}