import Koa from 'koa'
// import Router from 'koa-router'
// import { user } from './router/user'
import { loader } from './loader'
const app = new Koa
// const route = new Router

// route.get('/', user)

app.use(loader())
app.listen(3000, '127.0.0.1', () => {
  console.log('done')
})