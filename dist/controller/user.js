"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class User extends base_1.Controller {
    async user() {
        this.ctx.body = this.ctx.service.check.index(); //注意看这里
    }
    async userInfo() {
        this.ctx.body = 'hello userinfo';
    }
}
exports.default = User;
