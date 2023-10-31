module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
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
            args: [3, 50],
            msg: "Role must be between 2 and 30 characters.",
          },
        },
      },
      permissionJSON: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "roles",
    },
  );
  // Insert seed data if not found
  //   Role.sync({ force: false }).then(() => {
  //     return Role.findOrCreate({
  //       where: { name: "Manager" },
  //       defaults: {
  //         name: "Admin",
  //         permissionJSON: [
  //           {
  //             projects: {
  //               all: {
  //                 GET: true,
  //               },
  //               id: {
  //                 GET: true,
  //                 POST: true,
  //                 PUT: true,
  //                 DELETE: false,
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     });
  //   });
  return Role;
};
