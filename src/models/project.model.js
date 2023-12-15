module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 50],
            msg: "Project name must be between 2 and 50 characters.",
          },
        },
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          len: {
            args: [2, 1000],
            msg: "Description name must be between 2 and 1000 characters.",
          },
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.User,
          key: "id",
        },
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: sequelize.models.User,
          key: "id",
        },
      },
      closedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: sequelize.models.User,
          key: "id",
        },
      },
    },
    {
      // Other model options go here
      tableName: "projects",
      paranoid: true,
      timestamps: true,
      updateAt: true,
      deletedAt: "closedAt",
    },
  );

  // Define associations
  Project.associate = (models) => {
    // Project.sync({ alter: true });
    Project.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "createdByUser",
      onDelete: "CASCADE",
    });
    Project.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser",
      onDelete: "CASCADE",
    });
    Project.belongsTo(models.User, {
      foreignKey: "closedBy",
      as: "closedByUser",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.Task, {
      foreignKey: "projectId",
      onDelete: "CASCADE",
      as: "tasks",
    });
  };
  // Check is user is admin
  Project.prototype.checkIsAdmin = async function (userId) {
    return userId === this.createdBy;
  };

  // Check is user is admin
  Project.prototype.getTeamId = async function () {
    return this.createdBy;
  };

  return Project;
};
