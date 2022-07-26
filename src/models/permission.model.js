const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");
const Permission_Role = require("./permission_role.model");
const Permission_User = require("./permission_user.model");
const Role = require("./role.model");
const User = require("./user.model");

const Permission = sequelize.define(
  "Permission",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripcion del rol es requerida" },
        notNull: { msg: "La descripcion del rol es requerida" },
      },
      unique: { args: true, msg: "Rol ya registrado" },
    },
  },
  { timestamps: false }
);

Permission.belongsToMany(Role, { through: Permission_Role });
Role.belongsToMany(Permission, { through: Permission_Role });

Permission.belongsToMany(User, { through: Permission_User });
User.belongsToMany(Permission, { through: Permission_User });

module.exports = Permission;