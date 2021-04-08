'use strict';

const Sequelize = require('sequelize');
const config = {
//   dbConfig: {
    dialect: 'mysql',

    logging: false,
    database: WIKI.config.clouddb.db.toString(),
    host: WIKI.config.clouddb.host.toString(),
    username: WIKI.config.clouddb.user.toString(),
    password: WIKI.config.clouddb.pass.toString(),
    pool: {
      max: 20,
      idle: 30000,
    },
//   },
};
const sequelize = new Sequelize(WIKI.config.clouddb.db.toString(), null, null, config);
module.exports = {
  sequelize,
};
