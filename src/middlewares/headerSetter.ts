import { NextFunction, Request, Response } from 'express'
import { Config } from '../structures/config'

export default function headerSetter (config: Config) {
  return function (_: Request, res: Response, next: NextFunction) {
    for (const key of Object.keys(config.headers))
      res.setHeader(key, config.headers[key])

    next()
  }
}
