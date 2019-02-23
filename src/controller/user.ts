import { Controller } from './base'

export default class User extends Controller {
  async user() {

    this.ctx.body = this.ctx.service.check.index();//注意看这里
  }

  getConfig() {
    return (<any>this.app)['config']
  }

  async userInfo() {
    this.ctx.body = this.getConfig().middleware[0]
  }
}