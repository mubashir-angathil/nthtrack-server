module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["Invite", "Mention", "General"],
        defaultValue: "General",
        required: true,
      },
      content: {
        type: DataTypes.STRING,
        required: true,
      },
      broadcastIds: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      readersIds: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      authorId: {
        type: DataTypes.INTEGER,
        required: true,
        references: {
          model: sequelize.model.User,
          key: "id",
        },
      },
      projectId: {
        type: DataTypes.INTEGER,
        required: false,
        references: {
          model: sequelize.model.Project,
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        require: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      paranoid: true,
      timestamps: false,
      tableName: "notifications",
    },
  );
  Notification.associate = (models) => {
    // Notification.sync({ alter: true });
    Notification.belongsTo(models.User, {
      foreignKey: "authorId",
      as: "author",
      onDelete: "CASCADE",
    });
    Notification.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
  };
  return Notification;
};
