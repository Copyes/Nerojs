
const methods = ['get', 'post', 'del', 'put', 'option', 'patch']
interface BP {
  httpMethod: string,
  constructor: any,
  handler: string
}

interface BPs {
  [key: string]: Array<BP>
}
interface Decorator {
  (target: any, propertyKey: string): void
}
export interface blueprint extends Blueprint {
  post(url: string): Decorator

  get(url: string): Decorator

  del(url: string): Decorator
  patch(url: string): Decorator
  put(url: string): Decorator
  options(url: string): Decorator

}

class Blueprint {
  router: BPs = {} // 用于保存路由关系

  setRouter(url: string, blueprint: BP) {
    const _bp = this.router[url]

    if(_bp){
      for(let index in _bp){
        const object = _bp[index]
        if(object.httpMethod === blueprint.httpMethod){
          console.log(`路由地址 ${object.httpMethod} ${url} 已经存在`)
          return 
        }
      }
      this.router[url].push(blueprint)
    } else {
      this.router[url] = []
      this.router[url].push(blueprint)
    }
  }
  restfulClass(url: string) {
    return (Class: Function) => {
      ['Get', 'Post', 'Put', 'Del'].forEach(httpMethod => {
        const lowercaseMethod = httpMethod.toLowerCase()
        const handler = Class.prototype[httpMethod]

        if(handler){
          this.setRouter(url, {
            httpMethod: lowercaseMethod,
            constructor: Class,
            handler: httpMethod
          })
        }
      })
    }
  }
  get(url: string){
    return (target: any, propertyKey: string) => {
      (<any>this).setRouter(url, {
        httpMethod: 'get',
        constructor: target.constructor,
        handler: propertyKey
      })
    }
  }

  getRoute(){
    return this.router
  }
}

methods.forEach(httpMethod => {
  Object.defineProperty(Blueprint.prototype, httpMethod, {
    get(){
      return (url: string) => {
        return (target: any, propertyKey: string) => {
          (<any>this).setRouter(url, {
            httpMethod: 'get',
            constructor: target.constructor,
            handler: propertyKey
          })
        }
      }
    }
  })
})

export const bp: blueprint = <any>new Blueprint