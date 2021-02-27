export interface Config {
  port: number
  root: string
  dotfiles: string

  errors: {
    e404: string
  }

  features: {
    [key: string]: boolean
  }

  headers: {
    [key: string]: string
  }
}
