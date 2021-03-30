const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')



/* global WIKI */

module.exports = {
  /**
   * Gets the migration names
   * @returns Promise<string[]>
   */
  async getMigrations() {
    const baseMigrationPath = path.join(WIKI.RESOURCES_SERVER_PATH, (WIKI.config.db.type !== 'sqlite') ? 'db/migrations' : 'db/migrations-sqlite')
    const migrationFiles = await fs.readdir(baseMigrationPath)
    return migrationFiles.map(m => m.replace('.js', '')).sort(semver.compare).map(m => ({
      file: m,
      directory: baseMigrationPath
    }))
  },

  getMigrationName(migration) {
    return migration.file.indexOf('.js') >= 0 ? migration.file : `${migration.file}.js`
  },

  getMigration(migration) {
    const baseMigrationPath = (WIKI.config.db.type !== 'sqlite') ? '../db/migrations' : '../db/migrations-sqlite'
    return require(path.join(baseMigrationPath, migration.file))
  }
}
