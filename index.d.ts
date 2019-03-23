import { BaseContext, Request, Response } from 'koa'

declare module "koa" {
  export interface BaseContext {
    service: string,
    request: Request,
    response: Response
  }
}