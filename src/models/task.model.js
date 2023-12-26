module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      task: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          len: {
            args: [2, 500],
            msg: "Description name must be between 2 and 500 characters.",
          },
        },
      },
      labelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.model.Label, // table name
          key: "id",
        },
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.model.Status, // table name
          key: "id",
        },
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.model.Project, // table name
          key: "id",
        },
      },
      assignees: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.model.User,
          key: "id",
        },
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        references: {
          model: sequelize.model.User,
          key: "id",
        },
      },
    },
    {
      tableName: "tasks",
      paranoid: true,
      timestamps: true,
      deletedAt: false,
    },
  );

  Task.prototype.getAssignees = async function () {
    return await this.assignees;
  };

  // Define associations
  Task.associate = (models) => {
    // Task.sync({ alter: true });
    Task.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
    Task.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "createdByUser",
      onDelete: "CASCADE",
    });
    Task.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser",
      onDelete: "CASCADE",
    });
    Task.belongsTo(models.Status, {
      foreignKey: "statusId",
      onDelete: "CASCADE",
      as: "status",
    });
    Task.belongsTo(models.Label, {
      foreignKey: "labelId",
      onDelete: "CASCADE",
      as: "label",
    });
  };

  return Task;
};
