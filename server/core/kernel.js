const _ = require('lodash');
const EventEmitter = require('eventemitter2').EventEmitter2;
const chalk = require('chalk');

/* global WIKI */

module.exports = {
  async init() {
    WIKI.logger.info('=======================================');
    WIKI.logger.info(`= Wiki.js ${_.padEnd(WIKI.version + ' ', 29, '=')}`);
    WIKI.logger.info('=======================================');
    WIKI.logger.info('Initializing...');

    WIKI.models = require('./db').init();
    // WIKI.models_cloud = require('./db_cloud').init()
    // console.log('WIKI.models', WIKI.models, WIKI.models_cloud)

    try {
      await WIKI.models.onReady;
      //   await WIKI.models_cloud.onReady
      await WIKI.configSvc.loadFromDb();
      await WIKI.configSvc.applyFlags();
    } catch (err) {
      WIKI.logger.error('Database Initialization Error: ' + err.message);
      if (WIKI.IS_DEBUG) {
        console.error(err);
      }
      process.exit(1);
    }

    this.bootMaster();
  },
  /**
   * Sync To Cloud
   */
  async syncServer() {
    try {
      const db = require('../models_cloud');
      const Sequelize = require('sequelize');
      const Op = Sequelize.Op;

      WIKI.logger.info('============= Sync To Server ============');

      var localPages = await WIKI.models.pages.query().select('*').where({ isSynced: false });

      WIKI.logger.info('local data size ' + localPages.length);

      for (const page of localPages) {
        await db.pages.upsert(page);
        WIKI.logger.info('Uploaded to server db', page.id);
        page.isSynced = true;
        WIKI.logger.info('updateing page', page);
        await WIKI.models.pages.query().patch(page).where('id', page.id);
      }

      WIKI.logger.info('============= Sync To Local ============');
      localPages = await WIKI.models.pages.query().select('*').where({});
      console.log(
        'dd',
        localPages.map((page) => page.id),
      );
      var macaddress = require('macaddress');
      var mac = (await macaddress.one()) + '';
      var pageWhere = {};
      if (localPages.length) {
        pageWhere = {
          [Op.or]: [
            {
              localSynced: {
                [Op.or]: [{ [Op.eq]: null }, { [Op.notLike]: `%${mac}%` }],
              },
            },
            { id: { [Op.notIn]: localPages.map((page) => page.id) } },
          ],
        };
      }

      const serverPages = await db.pages.findAll({
        where: pageWhere,
      });

      for (const page of serverPages) {
        var clonedPage = JSON.parse(JSON.stringify(page));
        // console.log(clonedPage);
        if (clonedPage.publishStartDate) clonedPage.publishStartDate = clonedPage.publishStartDate.toString();
        else clonedPage.publishStartDate = '';

        if (clonedPage.publishEndDate) clonedPage.publishEndDate = clonedPage.publishEndDate.toString();
        else clonedPage.publishEndDate = '';
        if (clonedPage.privateNS == null) clonedPage.privateNS = '';
        if (clonedPage.content == null) clonedPage.content = '';
        if (clonedPage.path == null) clonedPage.path = '';
        delete clonedPage.localSynced;

        var onePage = await WIKI.models.pages.query().select('*').where({ id: page.id });

        if (onePage.length > 0) {
          //   await WIKI.models.pages.query().patch(clonedPage).where('id', page.id);
        } else {
          WIKI.logger.info(chalk.red('SYNC') + ': INSERT', page.id);
          await WIKI.models.pages.query().insert(clonedPage);
        }

        page.localSynced = page.localSynced + `,${mac}`;
        await page.update({ localSynced: page.localSynced });
        // console.log('page', page);
        WIKI.logger.info(chalk.red('SYNC') + ': Downloaded', page.id);
      }
      // db.sync();
      console.log(chalk.red('SYNC'), 'server data size ' + serverPages.length + ' mac = ' + mac);
    } catch (e) {
      console.log(chalk.red('SYNC'), e);
    }
  },
  /**
   * Pre-Master Boot Sequence
   */
  async preBootMaster() {
    try {
      await this.initTelemetry();
      WIKI.sideloader = await require('./sideloader').init();
      WIKI.cache = require('./cache').init();
      WIKI.scheduler = require('./scheduler').init();
      WIKI.servers = require('./servers');
      WIKI.events = {
        inbound: new EventEmitter(),
        outbound: new EventEmitter(),
      };
      WIKI.extensions = require('./extensions');
      WIKI.asar = require('./asar');
    } catch (err) {
      WIKI.logger.error(err);
      process.exit(1);
    }
  },
  /**
   * Boot Master Process
   */
  async bootMaster() {
    try {
      if (WIKI.config.setup) {
        WIKI.logger.info('Starting setup wizard...');
        require('../setup')();
      } else {
        await this.preBootMaster();
        await require('../master')();
        this.postBootMaster();
      }
    } catch (err) {
      WIKI.logger.error(err);
      process.exit(1);
    }
  },
  /**
   * Post-Master Boot Sequence
   */
  async postBootMaster() {
    await WIKI.models.analytics.refreshProvidersFromDisk();
    await WIKI.models.authentication.refreshStrategiesFromDisk();
    await WIKI.models.commentProviders.refreshProvidersFromDisk();
    await WIKI.models.editors.refreshEditorsFromDisk();
    await WIKI.models.loggers.refreshLoggersFromDisk();
    await WIKI.models.renderers.refreshRenderersFromDisk();
    await WIKI.models.searchEngines.refreshSearchEnginesFromDisk();
    await WIKI.models.storage.refreshTargetsFromDisk();

    await WIKI.extensions.init();

    await WIKI.auth.activateStrategies();
    await WIKI.models.commentProviders.initProvider();
    await WIKI.models.searchEngines.initEngine();
    await WIKI.models.storage.initTargets();
    WIKI.scheduler.start();

    await WIKI.models.subscribeToNotifications();
  },
  /**
   * Init Telemetry
   */
  async initTelemetry() {
    require('./telemetry').init();

    process.on('unhandledRejection', (err) => {
      WIKI.logger.warn(err);
      WIKI.telemetry.sendError(err);
    });
    process.on('uncaughtException', (err) => {
      WIKI.logger.warn(err);
      WIKI.telemetry.sendError(err);
    });
  },
  /**
   * Graceful shutdown
   */
  async shutdown() {
    if (WIKI.models) {
      await WIKI.models.unsubscribeToNotifications();
      await WIKI.models.knex.client.pool.destroy();
      await WIKI.models.knex.destroy();
    }
    if (WIKI.scheduler) {
      WIKI.scheduler.stop();
    }
    if (WIKI.asar) {
      await WIKI.asar.unload();
    }
    if (WIKI.servers) {
      await WIKI.servers.stopServers();
    }
  },
};
