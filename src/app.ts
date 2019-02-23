import Koa from 'koa'
import { Loader } from './loader'
const app = new Koa

const loader = new Loader
app.use(loader.loadRouter())
app.listen(3000, '127.0.0.1', () => {
  console.log('done')
})