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
          model: sequelize.models.Tracker, // table name
          key: "id",
        },
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Status, // table name
          key: "id",
        },
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Project, // table name
          key: "id",
        },
      },
    },
    {
      // Other model options go here
      tableName: "tasks",
      paranoid: true,
      timestamps: true,
      deletedAt: "closedAt",
    },
  );

  // // Define associations
  Task.associate = (models) => {
    Task.belongsTo(models.Project, {
      foreignKey: "projectId",
      onDelete: "RESTRICT",
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
