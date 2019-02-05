module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    notificationBody: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    seen: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
  });
  return Notification;
};
