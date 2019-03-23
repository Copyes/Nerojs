import { Controller } from './base'
import { bp } from '../blueprint';
export default class User extends Controller {
  async user() {

    this.ctx.body = this.ctx.service.check.index();//注意看这里
  }

  getConfig() {
    return (<any>this.app)['config']
  }

  @bp.get('/test')
  async userInfo() {
    this.ctx.body = this.getConfig().middleware[0]
  }
}