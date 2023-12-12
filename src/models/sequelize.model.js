const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const db = {};

const {
  HOST,
  DIALECT,
  DATABASE,
  DATABASE_PASSWORD,
  DATABASE_USER_NAME,
} = require("../configs/configs");
const { default: consola } = require("consola");

const sequelize = new Sequelize({
  host: HOST,
  dialect: DIALECT || "mysql",
  database: DATABASE,
  username: DATABASE_USER_NAME,
  password: DATABASE_PASSWORD,
  logging: (message) => {
    // consola.info(message.concat("\n"));
  },
});
const orderModel = [
  "status",
  "tracker",
  "user",
  "project",
  "task",
  "permission",
  "member",
  "notification",
];
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1,
  )
  .sort(
    (a, b) =>
      orderModel.indexOf(a.split(".")[0]) - orderModel.indexOf(b.split(".")[0]),
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  consola.success({ message: `Synced models: ${modelName}`, badge: true });
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
