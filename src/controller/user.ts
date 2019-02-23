import { Controller } from './base'

export default class User extends Controller {
  async user() {
    this.ctx.body = this.ctx.service.check.index();//注意看这里
  }

  async userInfo() {
    this.ctx.body = 'hello userinfo';
  }
}