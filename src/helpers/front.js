module.exports = {
  getPathname: (url) =>
    url.substring(0, url.indexOf("?") === -1 ? url.length : url.indexOf("?")),

  getRedirectUrl: (url) =>
    url.indexOf("?redirect") !== -1
      ? url.substring(url.indexOf("?redirect="))
      : "",
};
