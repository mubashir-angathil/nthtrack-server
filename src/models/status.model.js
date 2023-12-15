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
  // Status.sync().then(async () => {
  //   return await Status.bulkCreate([
  //     {
  //       name: "Todo",
  //     },
  //     {
  //       name: "InProgress",
  //     },
  //     {
  //       name: "Completed",
  //     },
  //   ]);
  // });

  return Status;
};
