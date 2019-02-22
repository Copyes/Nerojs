"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = async (ctx, next) => {
    ctx.body = 'hello ts-koa';
};
exports.userInfo = async (ctx, next) => {
    ctx.body = 'hello user info';
};
exports.default = {
    'get /': exports.user,
    'get /userinfo': exports.userInfo
};
