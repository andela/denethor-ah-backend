"use strict";

module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    rating: {
      allowNull: false,
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: false
  });
  return Rating;
};