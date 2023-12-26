const { labelColors } = require("../utils/constants/Constants");

module.exports = (sequelize, DataTypes) => {
  const Status = sequelize.define(
    "Status",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: [["name", "projectId"]],
          msg: "Status must be unique for a project",
        },
      },
      color: {
        type: DataTypes.ENUM(labelColors),
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Project,
          key: "id",
        },
      },
    },
    {
      // Other model options go here
      tableName: "statuses",
      timestamps: false,
    },
  );

  Status.associate = (models) => {
    Status.sync({ alter: true });
    Status.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
  };
  return Status;
};
