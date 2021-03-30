const path = require('path')
const resourceConfig = require('../config')

let WIKI = {
  IS_DEBUG: process.env.NODE_ENV === 'development',
  ROOTPATH: process.cwd(),
  SERVERPATH: path.join(process.cwd(), 'server'),
  RESOURCES_PATH: resourceConfig.RESOURCES_PATH,
  RESOURCES_SERVER_PATH: resourceConfig.RESOURCES_SERVER_PATH,
  Error: require('../helpers/error'),
  configSvc: require('./config')
}
global.WIKI = WIKI

WIKI.configSvc.init()
WIKI.logger = require('./logger').init('JOB')
const args = require('yargs').argv

;(async () => {
  await require(`../jobs/${args.job}`)(args.data)
  process.exit(0)
})()
