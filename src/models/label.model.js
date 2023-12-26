const { labelColors } = require("../utils/constants/Constants");

module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define(
    "Label",
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
          msg: "Label must be unique for a project",
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
      tableName: "labels",
      timestamps: false,
    },
  );

  Label.associate = (models) => {
    // Label.sync({ alter: true });
    Label.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
  };
  return Label;
};
