module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.User, // table name
          key: "id",
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Role, // table name
          key: "id",
        },
      },
      orgId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Organization, // table name
          key: "id",
        },
      },
    },
    {
      tableName: "userRoles",
    },
  );
  UserRole.associate = (models) => {
    UserRole.hasMany(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    UserRole.hasMany(models.Role, {
      foreignKey: "roleId",
      onDelete: "RESTRICT",
      as: "role",
    });
    UserRole.hasMany(models.Organization, {
      foreignKey: "orgId",
      onDelete: "CASCADE",
      as: "org",
    });
  };
  return UserRole;
};
