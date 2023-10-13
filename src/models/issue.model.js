module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define(
    "Issue",
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
      tracker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "trackers", // table name
          key: "id",
        },
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "statuses", // table name
          key: "id",
        },
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "projects", // table name
          key: "id",
        },
      },
    },
    {
      // Other model options go here
      tableName: "issues",
      paranoid: true,
      timestamps: true,
      deletedAt: "closedAt",
    },
  );

  // Define associations
  Issue.associate = (models) => {
    Issue.belongsTo(models.Project, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });
    Issue.belongsTo(models.Status, {
      foreignKey: "status_id",
      onDelete: "CASCADE",
    });
    Issue.belongsTo(models.Tracker, {
      foreignKey: "tracker_id",
      onDelete: "CASCADE",
    });
  };

  return Issue;
};
