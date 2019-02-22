export const user = async (ctx: any, next: any) => {
  ctx.body = 'hello ts-koa'
}

export const userInfo = async (ctx: any, next: any) => {
  ctx.body = 'hello user info'
}

export default {
  'get /': user,
  'get /userinfo': userInfo
}