"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onReady = exports.default = void 0;
const onReady = new Promise(function (resolve) {
  if (document.readyState === "complete" || document.readyState !== "loading" && !document.documentElement.doScroll) {
    resolve();
  } else {
    document.addEventListener("DOMContentLoaded", resolve);
  }
});
exports.onReady = onReady;
var _default = {
  onReady
};
exports.default = _default;