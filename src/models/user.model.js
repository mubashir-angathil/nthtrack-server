const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Please enter a valid email address.",
          },
        },
      },
      password: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
    },
    {
      // Other model options go here
      tableName: "users",
    },
  );

  // Hash the password before saving
  User.beforeCreate(async (user) => {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  });

  // You can also define a method to compare passwords
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
