module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: DataTypes.UUID,
    notificationBody: DataTypes.TEXT,
    seen: DataTypes.BOOLEAN
  });
  return Notification;
};
