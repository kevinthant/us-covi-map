"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("uuid/v1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const low = require('lowdb');

const FileSync = require('lowdb/adapters/FileSync');

class JsonFileStorage {
  constructor(jsonFile) {
    const adapter = new FileSync(jsonFile);
    this.db = low(adapter);
    this.db.defaults({
      jobs: []
    }).write();
    this.jobs = this.db.get('jobs').value();
  }

  find(predicate) {
    return Promise.resolve(this.jobs.filter(predicate));
  }

  add(data) {
    const id = (0, _v.default)();
    this.db.get('jobs').push(_objectSpread({}, data, {
      id
    })).write();
    this.jobs = this.db.get('jobs').value();
    return Promise.resolve(id);
  }

  remove(predicate) {
    this.jobs = this.jobs.filter(x => !predicate(x));
    this.db.set('jobs', this.jobs).write();
    return Promise.resolve(true);
  }

  update(keyValPairs, predicate) {
    this.jobs.forEach((x, i) => {
      if (!predicate(x)) {
        return true;
      }

      this.jobs[i] = _objectSpread({}, x, {}, keyValPairs);
    });
    this.db.set('jobs', this.jobs).write();
    return Promise.resolve(true);
  }

}

var _default = JsonFileStorage;
exports.default = _default;