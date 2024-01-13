module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "Member",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Project,
          key: "id",
        },
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Permission,
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM,
        values: ["Member", "Pending", "Super Admin"],
        defaultValue: "Pending",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.User,
          key: "id",
        },
      },
    },
    {
      tableName: "members",
    },
  );
  Member.associate = (model) => {
    // Member.sync({ alter: true });
    Member.belongsTo(model.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
    Member.belongsTo(model.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
    Member.belongsTo(model.Permission, {
      foreignKey: "permissionId",
      as: "permission",
    });
  };

  return Member;
};
