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
    },
    {
      // Other model options go here
      tableName: "statuses",
    },
  );

  // Insert seed data if not found
  Status.sync({ force: false }).then(() => {
    return Status.findOrCreate({
      where: { name: "Opened" },
      defaults: { name: "Opened" },
    }).then(() => {
      return Status.findOrCreate({
        where: { name: "Closed" },
        defaults: { name: "Closed" },
      });
    });
  });

  return Status;
};
