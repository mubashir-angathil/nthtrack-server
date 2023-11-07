module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: {
          msg: "Permission already existed",
        },
      },
      json: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "userPermissions",
    },
  );
  return Permission;
};
