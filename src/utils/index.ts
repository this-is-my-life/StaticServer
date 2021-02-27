import { existsSync, readFileSync } from 'fs'
import { parse as yaml } from 'yaml'
import { Config } from '../structures/config'

export function getConfig (path: string) {
  const configExists = existsSync(path)
  if (!configExists) {
    console.log('Configuration File not found (./config.yml)')
    process.exit(1)
  }

  const configRaw = readFileSync(path).toString('utf-8')
  return yaml(configRaw).configurations as Config
}
