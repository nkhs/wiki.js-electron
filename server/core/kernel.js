const _ = require('lodash');
const EventEmitter = require('eventemitter2').EventEmitter2;
const chalk = require('chalk');
var request = require('request');
const axios = require('axios');

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
    async syncTableToServer2(name) {
        try {
            var macaddress = require('macaddress');
            var mac = (await macaddress.one()) + '';

            //   var localPages = await WIKI.models[name].query().select('*').where({ isSynced: false });
            var localPages = await WIKI.models.knex.table(name).where({ isSynced: false });

            WIKI.logger.info(
                chalk.red('SYNC') +
                    chalk.blue(_.padStart(name, 10)) +
                    '============= Sync To Server =========== ' +
                    localPages.length,
            );
            localPages = localPages.map((item) => ({ ...item, localSynced: null }));
            var SERVER = WIKI.config.socket;
            axios
                .post(`${SERVER}/sync-to-server`, { localPages, name, mac })
                .then(async (res) => {
                    console.log(res.data);
                    for (const page of localPages) {
                        try {

                            page.isSynced = true;
                            delete page.localSynced;
                            await WIKI.models.knex.table(name).where({ id: page.id }).update(page);
                        } catch (e) {
                            WIKI.logger.info(
                                chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'error' + e.toString(),
                            );
                        }
                    }
                })
                .catch((error) => {
                    // console.error(error);
                    WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'API ERROR');
                });
        } catch (e) {
            console.log(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)), e, name);
        }
    },
    async syncTableToLocal2(name) {
        try {
            var macaddress = require('macaddress');
            var mac = (await macaddress.one()) + '';

            var localPages = await WIKI.models.knex.table(name).where({});
            var SERVER = WIKI.config.socket;

            WIKI.logger.info(
                chalk.red('SYNC') +
                    chalk.blue(_.padStart(name, 10)) +
                    '============= Sync To Local ============ localPages ' +
                    localPages.length,
            );

            axios
                .post(`${SERVER}/sync-to-local`, { localPages, name, mac })
                .then(async (res) => {
                    var serverPages = res.data;
                    // console.log('serverPages', serverPages);

                    WIKI.logger.info(
                        chalk.red('SYNC') +
                            chalk.blue(_.padStart(name, 10)) +
                            '============= Sync To Local ============ ' +
                            serverPages.length,
                    );
                    for (const page of serverPages) {
                        try {
                            var clonedPage = JSON.parse(JSON.stringify(page));
                            // console.log(clonedPage);
                            if (name == 'pages') {
                                if (clonedPage.publishStartDate)
                                    clonedPage.publishStartDate = clonedPage.publishStartDate.toString();
                                else clonedPage.publishStartDate = '';

                                if (clonedPage.publishEndDate)
                                    clonedPage.publishEndDate = clonedPage.publishEndDate.toString();
                                else clonedPage.publishEndDate = '';
                                if (clonedPage.privateNS == null) clonedPage.privateNS = '';
                                if (clonedPage.content == null) clonedPage.content = '';
                                if (clonedPage.path == null) clonedPage.path = '';
                            }
                            delete clonedPage.localSynced;

                            var onePage = await WIKI.models.knex.table(name).select('*').where({ id: page.id });

                            if (onePage.length > 0) {
                                //   await WIKI.models.pages.query().patch(clonedPage).where('id', page.id);
                            } else {
                                WIKI.logger.info(
                                    chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + ': INSERT',
                                    page.id,
                                );
                                await WIKI.models.knex.table(name).insert(clonedPage);
                            }

                            // console.log('page', page);
                            WIKI.logger.info(
                                chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + ': Downloaded',
                                page.id,
                            );

                            console.log(
                                chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)),
                                'server data size ' + serverPages.length + ' mac = ' + mac,
                            );
                        } catch (e) {
                            WIKI.logger.info(
                                chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'error' + e.toString(),
                            );
                        }
                    }
                })
                .catch((error) => {
                    WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'API ERROR');
                    // console.error(error);
                });

            // db.sync();

            //*/
        } catch (e) {
            console.log(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)), e, name);
        }
    },
    async syncTable(name) {
        this.syncTableToServer2(name);
        this.syncTableToLocal2(name);
    },
    /**
     * Sync To Cloud
     */
    async syncServer() {
        this.syncTable('pages');
        this.syncTable('pageTree');
        this.syncTable('assets');
        this.syncTable('assetFolders');
        this.syncTable('assetData');
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
