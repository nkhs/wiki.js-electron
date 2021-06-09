// async syncTableToServer(name) {
  //   try {
  //     var macaddress = require('macaddress');
  //     var mac = (await macaddress.one()) + '';

  //     const db = require('../models_cloud');
  //     const Sequelize = require('sequelize');
  //     const Op = Sequelize.Op;

  //     var localPages = await WIKI.models.knex.table(name).where({ isSynced: false });

  //     WIKI.logger.info(
  //       chalk.red('SYNC') +
  //         chalk.blue(_.padStart(name, 10)) +
  //         '============= Sync To Server =========== ' +
  //         localPages.length,
  //     );

  //     for (const page of localPages) {
  //       try {
  //         page.localSynced = `${mac}`;
  //         await db[name].upsert(page);
  //         // WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'Uploaded to server db ' + page.id);
  //         page.isSynced = true;
  //         delete page.localSynced;
  //         await WIKI.models.knex.table(name).where({ id: page.id }).update(page);
  //       } catch (e) {
  //         WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'error' + e.toString());
  //       }
  //     }
  //     //*/
  //   } catch (e) {
  //     console.log(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)), e, name);
  //   }
  // },
  // async syncTableToLocal(name) {
  //   try {
  //     var macaddress = require('macaddress');
  //     var mac = (await macaddress.one()) + '';

  //     const db = require('../models_cloud');
  //     const Sequelize = require('sequelize');
  //     const Op = Sequelize.Op;


  //   var  localPages = await WIKI.models.knex.table(name).where({});

  //     var pageWhere = {};
  //     if (localPages.length) {
  //       pageWhere = {
  //         [Op.or]: [
  //           {
  //             localSynced: {
  //               [Op.or]: [{ [Op.eq]: null }, { [Op.notLike]: `%${mac}%` }],
  //             },
  //           },
  //           { id: { [Op.notIn]: localPages.map((page) => page.id) } },
  //         ],
  //       };
  //     }

  //     const serverPages = await db[name].findAll({
  //       where: pageWhere,
  //     });
  //     WIKI.logger.info(
  //       chalk.red('SYNC') +
  //         chalk.blue(_.padStart(name, 10)) +
  //         '============= Sync To Local ============ ' +
  //         serverPages.length,
  //     );
  //     for (const page of serverPages) {
  //       try {
  //         var clonedPage = JSON.parse(JSON.stringify(page));
  //         // console.log(clonedPage);
  //         if (name == 'pages') {
  //           if (clonedPage.publishStartDate) clonedPage.publishStartDate = clonedPage.publishStartDate.toString();
  //           else clonedPage.publishStartDate = '';

  //           if (clonedPage.publishEndDate) clonedPage.publishEndDate = clonedPage.publishEndDate.toString();
  //           else clonedPage.publishEndDate = '';
  //           if (clonedPage.privateNS == null) clonedPage.privateNS = '';
  //           if (clonedPage.content == null) clonedPage.content = '';
  //           if (clonedPage.path == null) clonedPage.path = '';
  //         }
  //         delete clonedPage.localSynced;

  //         var onePage = await WIKI.models.knex.table(name).select('*').where({ id: page.id });

  //         if (onePage.length > 0) {
  //           //   await WIKI.models.pages.query().patch(clonedPage).where('id', page.id);
  //         } else {
  //           WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + ': INSERT', page.id);
  //           await WIKI.models.knex.table(name).insert(clonedPage);
  //         }

  //         page.localSynced = page.localSynced + `,${mac}`;
  //         await page.update({ localSynced: page.localSynced });
  //         // console.log('page', page);
  //         WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + ': Downloaded', page.id);
  //       } catch (e) {
  //         WIKI.logger.info(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)) + 'error' + e.toString());
  //       }
  //     }
  //     // db.sync();
  //     console.log(
  //       chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)),
  //       'server data size ' + serverPages.length + ' mac = ' + mac,
  //     );
  //     //*/
  //   } catch (e) {
  //     console.log(chalk.red('SYNC') + chalk.blue(_.padStart(name, 10)), e, name);
  //   }
  // },