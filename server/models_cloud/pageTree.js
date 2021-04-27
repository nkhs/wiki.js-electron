'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pageTree extends Model {
    static associate(models) {
      // define association here
    }
  }
  pageTree.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      path: { type: DataTypes.STRING },
      depth: { type: DataTypes.INTEGER },
      title: { type: DataTypes.STRING },
      isPrivate: { type: DataTypes.BOOLEAN },
      isFolder: { type: DataTypes.BOOLEAN },
      privateNS: { type: DataTypes.STRING },
      parent: { type: DataTypes.INTEGER },
      pageId: { type: DataTypes.INTEGER },
      localeCode: { type: DataTypes.STRING },
      ancestors: { type: DataTypes.JSON },

      isSynced: { type: DataTypes.BOOLEAN }, //updated to cloud
      localSynced: { type: DataTypes.TEXT }, // updated to local
      isDeleted: { type: DataTypes.BOOLEAN },
    },
    {
      sequelize,
      modelName: 'pageTree',
      tableName: 'pageTree',
      timestamps: false,
      // defaultScope: {
      //     attributes: { exclude: ["createdAt", "updatedAt"] }
      // }
    },
  );
    // pageTree.sync({
    //   force: true,
    // });
  return pageTree;
};
