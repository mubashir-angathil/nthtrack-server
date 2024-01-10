const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "email already existed",
        },
        validate: {
          isEmail: {
            msg: "Please enter a valid email address.",
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Username already taken",
        },
        validate: {
          is: {
            args: /^[a-zA-Z ]+$/i,
            msg: "Username can only contain letters, spaces",
          },
          len: {
            args: [2, 15],
            msg: "Username must be between 2 and 15 characters long",
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
