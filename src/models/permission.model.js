module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.User,
          key: "id",
        },
      },
      projectId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Project,
          key: "id",
        },
      },
    },
    {
      tableName: "permissions",
    },
  );
  Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Permission.belongsTo(models.Project, {
      foreignKey: "projectId",
      onDelete: "CASCADE",
    });
  };
  return Permission;
};
