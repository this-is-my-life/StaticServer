const yaml = require('yaml')
const express = require('express')
const { renderFile: render } = require('ejs')
const { existsSync, readFileSync, statSync, readdirSync } = require('fs')
const { exec } = require('child_process')
const path = require('path').resolve()

const configPath = path + '/config.yaml'
const isConfigExists = existsSync(configPath)
if (!isConfigExists) throw new Error(configPath + ' not found')

const { configurations } = yaml.parse(readFileSync(configPath, 'utf-8'))
if (!configurations) throw new Error(configPath + ' format invalid')

const app = express()

app.use((_, res, next) => {
  for (const header of Object.keys(configurations.headers || {})) {
    res.setHeader(header, configurations.headers[header])
  }
  next()
})

app.use((req, res, next) => {
  const target = (configurations.root || path + '/test') + req.path
  const { raw, dl, pull } = req.query
  if (raw) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.send(readFileSync(target).toString('utf-8'))
  }

  if (dl) return res.download(target)
  if (pull) {
    exec('git pull', { cwd: target + '/..' }, (_, stdout, stderr) => {
      res.send(stdout || stderr)
    })
  }

  next()
})

app.use(express.static(configurations.root || path + '/test', { dotfiles: configurations.dotfiles || 'ignore' }))
app.use(async (req, res, next) => {
  const target = (configurations.root || path + '/test') + req.path

  if (!existsSync(target)) return next()
  if (statSync(target).isDirectory()) {
    const data = readdirSync(target, 'utf-8').reduce((prev, curr) => [...prev, { name: curr, stats: statSync(target + curr) }], [])
    const str = await render(path + '/page/list.ejs', { path: req.path, data })

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    return res.send(str)
  }
  next()
})

app.use((_, res) => {
  const target = (configurations.root || path + '/test') + (configurations.errors.e404 || '/errors/404.html')

  if (!existsSync(target)) return res.sendStatus(404)

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.send(readFileSync(target, 'utf-8'))
})

app.listen(configurations.port || 8080, () => console.log('Server is now on http://localhost:' + (configurations.port || 8080)))
