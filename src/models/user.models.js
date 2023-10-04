module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
          allowNull: false,
          unique: true,
        },
      },
      password: {
        type: DataTypes.STRING(32),
      },
    },
    {
      // Other model options go here
      tableName: "users",
    },
  );

  return User;
};
