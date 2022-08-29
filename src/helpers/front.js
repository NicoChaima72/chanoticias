const moment = require("moment");
moment.locale("es");

module.exports = {
  getPathname: (url) => {
    const pathname = url.substring(
      0,
      url.indexOf("?") === -1 ? url.length : url.indexOf("?")
    );
    return pathname !== "/" &&
      pathname.substring(0, pathname.substring(1).indexOf("/") + 1) !== "/auth"
      ? "?redirect=" + pathname
      : "";
  },

  getRedirectUrl: (url) =>
    url.indexOf("?redirect") !== -1
      ? url.substring(url.indexOf("?redirect="))
      : "",

  getValue: (data, model) => {
    if (!!data) return data;
    if (!!model) return model;
    return "";
  },
  isActiveUrl: (currentUrl, checkUrl) => {
    currentUrl = currentUrl === "/" ? "" : currentUrl;
    currentUrl =
      currentUrl.indexOf("?") !== -1
        ? currentUrl.substring(0, currentUrl.indexOf("?"))
        : currentUrl;

    currentUrl = currentUrl.split("/").filter((n) => n);
    checkUrl = checkUrl.split("/").filter((n) => n);

    if (checkUrl[checkUrl.length - 1] === "*") {
      checkUrl.pop();
      currentUrl = currentUrl.slice(0, checkUrl.length);
    }

    return JSON.stringify(currentUrl) === JSON.stringify(checkUrl);
  },
  getColorsCategories: () => [
    { value: "#6b7280", name: "Gray" },
    { value: "#78716c", name: "Stone" },
    { value: "#ef4444", name: "Red" },
    { value: "#f97316", name: "Orange" },
    { value: "#f59e0b", name: "Amber" },
    { value: "#eab308", name: "Yellow" },
    { value: "#84cc16", name: "Lime" },
    { value: "#22c55e", name: "Green" },
    { value: "#10b981", name: "Esmerald" },
    { value: "#14b8a6", name: "Teal" },
    { value: "#06b6d4", name: "Cyan" },
    { value: "#0ea5e9", name: "Sky" },
    { value: "#3b82f6", name: "Blue" },
    { value: "#6366f1", name: "Indigo" },
    { value: "#8b5cf6", name: "Violet" },
    { value: "#a855f7", name: "Purple" },
    { value: "#d946ef", name: "Fuchsia" },
    { value: "#ec4899", name: "Pink" },
    { value: "#f43f5e", name: "Rose" },
  ],

  moment: (time, format) =>
    moment(time).format(format).charAt(0).toUpperCase() +
    moment(time).format(format).substring(1),

  can: (user, verifyPermission) => {
    const userPermissions = user.AllPermissions.map((userPermission) => {
      return userPermission.description.toLowerCase();
    });

    if (typeof verifyPermission === "string")
      return userPermissions.includes(verifyPermission.toLowerCase());

    for (const permission of verifyPermission) {
      if (userPermissions.includes(permission.toLowerCase())) {
        return true;
      }
    }

    return false;
  },

  canGroup: (user, verifyGroupPermission) => {
    const userGroups = user.AllPermissions.map((userPermission) => {
      return userPermission.group.toLowerCase();
    });

    return userGroups.includes(verifyGroupPermission.toLowerCase());
  },

  addQueryString: (currentUrl, queryString) => {
    if (currentUrl.indexOf("?") === -1) return `${currentUrl}?${queryString}`;

    let queryStringsUrl = currentUrl.substring(currentUrl.indexOf("?"));
    let queryStringWithoutValue = queryString.substring(
      0,
      queryString.indexOf("=") + 1
    );
    let valueOfQueryString = queryString.substring(
      queryString.indexOf("=") + 1
    );

    if (queryStringsUrl.indexOf(queryStringWithoutValue) === -1)
      return `${currentUrl}&${queryString}`;

    queryStringsUrl = queryStringsUrl.substring(
      queryStringsUrl.indexOf(queryStringWithoutValue)
    );

    // si el query string es el ultimo parametro que se envia www.example.com?any=10&any=10&queryString=value
    if (queryStringsUrl.indexOf("&") === -1) {
      // queryStringsUrl = queryStringsUrl.substring(0, queryStringWithoutValue.length);
      currentUrl = currentUrl.substring(
        0,
        currentUrl.indexOf(queryStringWithoutValue)
      );
      return `${currentUrl}${queryString}`;
    }

    return (
      currentUrl.substring(0, currentUrl.indexOf(queryStringWithoutValue)) +
        queryString +
        currentUrl
          .substring(currentUrl.indexOf(queryStringWithoutValue))
          .substring(
            currentUrl
              .substring(currentUrl.indexOf(queryStringWithoutValue))
              .indexOf("&")
          )
    );

    return true;
  },
};
