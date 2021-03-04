import archiver from 'archiver'
import { exec } from 'child_process'
import { NextFunction, Request, Response } from 'express'
import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import { Config } from '../structures/config'

export default function apiParser (config: Config) {
  return function (req: Request, res: Response, next: NextFunction) {
    const target = path.join(config.root, req.path)

    if (!existsSync(target)) return next()

    const stat = lstatSync(target)
    const { raw, dl, pull, redirect } = req.query

    if (raw) {
      if (stat.isDirectory()) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.status(404).send(req.path + ' is a directory')
        return
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.send(readFileSync(target).toString('utf-8'))
      return
    }

    if (dl) {
      if (stat.isDirectory()) {
        if (!config.features.zipDirectory) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.status(404).send(req.path + ' is a directory')
          return
        }

        res.set('Content-Type', 'application/zip')

        const archive = archiver('zip', { zlib: { level: 9 } })

        archive.directory(target, '/')
        archive.finalize()

        archive.on('data', (bf) => res.write(bf))
        archive.on('finish', () => res.end())
        return
      }

      res.download(target)
      return
    }

    if (pull) {
      if (!stat.isDirectory()) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.status(404).send(req.path + ' is not a git directory')
        return
      }

      exec('git pull', { cwd: path.join(target, '/..') },
        (_, stdout, stderr) => res.send(stdout || stderr))
      return
    }

    if (redirect) {
      if (!stat.isDirectory()) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.status(404).send(req.path + ' is not a directory')
        return
      }

      const contents = readdirSync(target)
      switch (redirect) {
        case 'firstOrder': {
          res.redirect(contents[0])
          break
        }

        case 'lastOrder': {
          res.redirect(contents[contents.length - 1])
          break
        }

        default: {
          next()
        }
      }

      return
    }

    next()
  }
}
