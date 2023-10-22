module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Status,
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
    // Project.hasMany(models.Task, {
    //   foreignKey: "projectId",
    //   onDelete: "RESTRICT",
    //   as: "tasks",
    // });
  };
  return Project;
};
