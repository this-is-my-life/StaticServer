import { NextFunction, Request, Response } from 'express'
import { existsSync } from 'fs'
import path from 'path'
import { Config } from '../structures/config'

export default function e404Parser (config: Config) {
  return function (_: Request, res: Response, __: NextFunction) {
    const target = path.join(config.root, config.errors.e404)
    if (!existsSync(target)) return res.send('Not found :(')

    res.sendFile(target)
  }
}
