module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      foreignKey: "status_id",
      onDelete: "RESTRICT",
    });
  };
  return Project;
};
