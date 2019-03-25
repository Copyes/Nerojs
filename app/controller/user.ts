import { Controller } from '../../src/base/controller'
import { bp } from '../../src/blueprint'
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