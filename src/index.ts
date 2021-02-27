import express from 'express'
import path from 'path'
import apiParser from './middlewares/apiParser'
import e404Parser from './middlewares/e404Parser'
import headerSetter from './middlewares/headerSetter'
import listRenderer from './middlewares/listRenderer'
import { getConfig } from './utils'

const PATH = process.cwd()
const CONFIG_PATH = path.join(PATH, '/config.yaml')

const app = express()
const config = getConfig(CONFIG_PATH)

app.use(headerSetter(config))
app.use(apiParser(config))

app.use(express.static(config.root, { dotfiles: config.dotfiles }))
app.use(listRenderer(config))

app.use(e404Parser(config))

app.listen(config.port, () =>
  console.log('Server is now on http://localhost:' + config.port))
