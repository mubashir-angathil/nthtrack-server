module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trackerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.model.Tracker, // table name
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
      closedBy: {
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
      updatedAt: true,
      deletedAt: "closedAt",
    },
  );

  Task.prototype.getAssignees = async function () {
    return await this.assignees;
  };

  // Define associations
  Task.associate = (models) => {
    Task.belongsTo(models.Project, {
      foreignKey: "projectId",
      onDelete: "RESTRICT",
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
    Task.belongsTo(models.User, {
      foreignKey: "closedBy",
      as: "closedByUser",
      onDelete: "CASCADE",
    });
    Task.belongsTo(models.Status, {
      foreignKey: "statusId",
      onDelete: "RESTRICT",
      as: "status",
    });
    Task.belongsTo(models.Tracker, {
      foreignKey: "trackerId",
      onDelete: "RESTRICT",
      as: "tracker",
    });
  };

  return Task;
};
