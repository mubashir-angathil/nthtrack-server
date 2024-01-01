module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      message: {
        type: DataTypes.STRING,
        required: true,
      },
      broadcastId: {
        type: DataTypes.INTEGER,
        require: true,
      },
      readers: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      createdAt: {
        type: DataTypes.DATE,
        require: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      paranoid: true,
      tableName: "notifications",
    },
  );
  return Notification;
};
