module.exports = (sequelize, DataTypes) => {
  const Tracker = sequelize.define(
    "Tracker",
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
      tableName: "trackers",
    },
  );

  // Insert seed data if not found
  Tracker.sync({ force: false }).then(() => {
    return Tracker.findOrCreate({
      where: { name: "Bug" },
      defaults: { name: "Bug" },
    }).then(() => {
      return Tracker.findOrCreate({
        where: { name: "Error" },
        defaults: { name: "Error" },
      });
    });
  });

  return Tracker;
};
