'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pages extends Model {
    static associate(models) {
      // define association here
    }
  }
  pages.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      path: { type: DataTypes.STRING },
      hash: { type: DataTypes.STRING },
      title: { type: DataTypes.STRING },
      description: { type: DataTypes.STRING },
      isPublished: { type: DataTypes.BOOLEAN },
      privateNS: { type: DataTypes.STRING },
      publishStartDate: { type: DataTypes.STRING },
      publishEndDate: { type: DataTypes.STRING },
      content: { type: DataTypes.STRING },
      contentType: { type: DataTypes.STRING },

      isSynced: { type: DataTypes.BOOLEAN }, //updated to cloud
      localSynced: { type: DataTypes.TEXT }, // updated to local

      createdAt: { type: DataTypes.STRING },
      updatedAt: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: 'pages',
      timestamps: false
      // defaultScope: {
      //     attributes: { exclude: ["createdAt", "updatedAt"] }
      // }
    },
  );
//   pages.sync({
//     force: true,
//   });
  return pages;
};
