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
      },
      color: {
        type: DataTypes.ENUM(labelColors),
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      indexes: [
        {
          unique: true,
          fields: ["name", "projectId"],
          name: "name",
        },
      ],
    },
  );

  Status.associate = (models) => {
    // Status.sync({ alter: true });
    Status.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
      onDelete: "CASCADE",
    });
  };
  return Status;
};
