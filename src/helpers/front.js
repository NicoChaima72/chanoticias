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
    currentUrl = currentUrl.substring("/panel".length);
    currentUrl = currentUrl === "/" ? "" : currentUrl;
    checkUrl =
      checkUrl[checkUrl.length - 1] === "/"
        ? checkUrl.substring(0, checkUrl.length - 1)
        : checkUrl;

    if (checkUrl.indexOf("*") === -1) return currentUrl === checkUrl;

    checkUrl = checkUrl.substring(0, checkUrl.length - 1);
    currentUrl = currentUrl.substring(0, checkUrl.length);

    checkUrl = checkUrl.split("/").filter((n) => n);
    currentUrl = currentUrl.split("/").filter((n) => n);

    return JSON.stringify(checkUrl) === JSON.stringify(currentUrl);
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
};
