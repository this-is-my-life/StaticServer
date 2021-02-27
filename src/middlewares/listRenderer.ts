import { renderFile as render } from 'ejs'
import { NextFunction, Request, Response } from 'express'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import byteParser from 'pretty-bytes'
import { Converter } from 'showdown'
import { Config } from '../structures/config'

const PATH = process.cwd()

export default function listRenderer (config: Config) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const target = path.join(config.root, req.path)

    if (!existsSync(target)) return next()
    if (!statSync(target).isDirectory()) return next()

    let readme = ''
    const readmePath = path.join(target, '/README.md')

    if (existsSync(readmePath)) {
      const converter = new Converter()
      const readmeRaw = readFileSync(readmePath).toString('utf-8')
      
      readme = converter.makeHtml(readmeRaw)
    }

    const contents = readdirSync(target)
    const data = contents.map((content) => ({ name: content, stats: statSync(path.join(target, content)) }))
    const str = await render(path.join(PATH, '/page/list.ejs'), { config, path: req.path, byteParser, data, readme })

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.send(str)
    return
  }
}
