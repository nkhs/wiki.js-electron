const fs = require('fs-extra')
const path = require('path')

/* global WIKI */

module.exports = {
  ext: {},
  async init () {
    const extDirs = await fs.readdir(path.join(WIKI.RESOURCES_SERVER_PATH, 'modules/extensions'))
    WIKI.logger.info(`Checking for installed optional extensions...`)
    for (let dir of extDirs) {
      WIKI.extensions.ext[dir] = require(path.join(__dirname, '../modules/extensions', dir, 'ext.js'))
      const isInstalled = await WIKI.extensions.ext[dir].check()
      if (isInstalled) {
        WIKI.logger.info(`Optional extension ${dir} is installed. [ OK ]`)
      } else {
        WIKI.logger.info(`Optional extension ${dir} was not found on this system. [ SKIPPED ]`)
      }
    }
  }
}
