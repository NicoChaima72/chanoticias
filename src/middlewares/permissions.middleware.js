exports.can = (verifyPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.AllPermissions.map((userPermission) => {
      return userPermission.description.toLowerCase();
    });

    if (typeof verifyPermission === "string") {
      if (userPermissions.includes(verifyPermission.toLowerCase())) {
        return next();
      }
    }
    // le pasan un objeto como parametro
    else {
      for (const permission of verifyPermission) {
        if (userPermissions.includes(permission.toLowerCase())) {
          return next();
        }
      }

      // verifyPermission.map((permission) => {
      // });
    }

    return res.redirect("/panel");
  };
};

exports.canGroup = (verifyGroupPermission) => {
  return (req, res, next) => {
    const userGroups = req.user.AllPermissions.map((userPermission) => {
      return userPermission.group.toLowerCase();
    });

    if (!userGroups.includes(verifyGroupPermission.toLowerCase())) {
      return res.redirect("/panel");
    }

    next();
  };
};
