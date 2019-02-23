import { BaseContext } from 'koa'
export default class Service {
  ctx: BaseContext

  constructor(ctx: BaseContext){
    this.ctx = ctx
  }
}