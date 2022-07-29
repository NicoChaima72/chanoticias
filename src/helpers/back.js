const _ = require("underscore");

module.exports = {
  getHostname: (req) =>
    `${req.protocol}://${req.hostname}${
      req.hostname === "localhost" && ":" + process.env.PORT
    }`,

  handleErrorSequelize: (err) => {
    if (err.name === "SequelizeConnectionRefusedError") {
      return {
        global: { message: "Ha ocurrido un error, intentalo mas tarde" },
      };
    }

    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      err = _.indexBy(
        err.errors,
        "path"
      ); /* https://underscorejs.org/#indexBy */

      return err;
    }

    return err;
  },

  clearString: (string) => {
    return string
      .replace(/&/g, "&amp;")
      .replace(/>/g, "&gt;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;")
      .trim();
  },

  getKeyByUrlS3: (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  },

  getWithAllPermissions: (user) => {
    const permissionsByRole = user.Role.Permissions;
    const customPermissions = user.Permissions;

    let idsToRemove = customPermissions.filter(
      (permission) => permission.Permission_User.action === "remove"
    );

    idsToRemove = idsToRemove.map((permission) => permission.id);

    const permissions = [];

    permissionsByRole.map((permission) => {
      if (!idsToRemove.includes(permission.id)) permissions.push(permission);
    });

    customPermissions.map((permission, index) => {
      if (permission.Permission_User.action === "add")
        permissions.push(permission);
    });

    let result = { ...user.get(), AllPermissions: permissions };
    delete result.Permissions;
    delete result.Role;

    result.Role = {
      id: user.Role.id,
      slug: user.Role.slug,
      description: user.Role.description,
    };

    return result;
  },
};
