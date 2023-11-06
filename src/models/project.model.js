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
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Status,
          key: "id",
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
    },
    {
      // Other model options go here
      tableName: "projects",
      paranoid: true,
      timestamps: true,
      deletedAt: "closedAt",
    },
  );

  // Define associations
  Project.associate = (models) => {
    Project.belongsTo(models.Status, {
      foreignKey: "statusId",
      onDelete: "RESTRICT",
      as: "status",
    });
    Project.belongsTo(models.User, {
      foreignKey: "createdBy",
      onDelete: "RESTRICT",
    });
    Project.hasMany(models.Task, {
      foreignKey: "projectId",
      onDelete: "RESTRICT",
      as: "tasks",
    });
  };
  return Project;
};
