module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
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
            args: [3, 60],
            msg: "Organization name must be between 2 and 60 characters.",
          },
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.User, // table name
          key: "id",
        },
      },
    },
    {
      tableName: "organizations",
    },
  );
  Organization.associate = (models) => {
    Organization.belongsTo(models.User, {
      foreignKey: "createdBy",
    });
  };
  return Organization;
};
