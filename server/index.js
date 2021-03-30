// ===========================================
// Wiki.js
// Licensed under AGPLv3
// ===========================================

const path = require('path')
const { nanoid } = require('nanoid')
const { DateTime } = require('luxon')
const { EventEmitter } = require('events')
const resourceConfig = require('./config')

let WIKI = {
  serverEvent: new EventEmitter(),
  IS_DEBUG: process.env.NODE_ENV === 'development',
  IS_MASTER: true,
  ROOTPATH: './',
  INSTANCE_ID: nanoid(10),
  SERVERPATH: './server',
  RESOURCES_PATH: resourceConfig.RESOURCES_PATH,
  RESOURCES_SERVER_PATH: resourceConfig.RESOURCES_SERVER_PATH,
  Error: require('./helpers/error'),
  configSvc: require('./core/config'),
  kernel: require('./core/kernel'),
  startedAt: DateTime.utc()
}
global.WIKI = WIKI

WIKI.configSvc.init()

// ----------------------------------------
// Init Logger
// ----------------------------------------

WIKI.logger = require('./core/logger').init('MASTER')

// ----------------------------------------
// Start Kernel
// ----------------------------------------

WIKI.kernel.init()
