"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const mysql = require('mysql2');

const config = require('config');

const {
  host,
  username,
  password,
  database
} = config.get('db');
const pool = mysql.createPool({
  host,
  user: username,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
});
var _default = pool;
exports.default = _default;