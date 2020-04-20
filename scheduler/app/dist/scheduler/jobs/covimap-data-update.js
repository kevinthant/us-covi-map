"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _csvDataUpdater = _interopRequireDefault(require("./../../library/csv-data-updater"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mysql = require('mysql2');

const config = require('config');

const updateStateData = async conn => {
  const csvUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
  await (0, _csvDataUpdater.default)({
    type: 'state',
    conn,
    csvUrl,
    latestDataQuery: `select state as id, MAX(\`date\`) as date from state_cases  GROUP BY state`,
    schema: `CREATE TABLE IF NOT EXISTS \`state_cases\` (
      \`date\` date DEFAULT NULL,
      \`state\` varchar(50) DEFAULT NULL,
      \`fips\` varchar(20) DEFAULT NULL,
      \`cases\` int(11) DEFAULT NULL,
      \`deaths\` int(11) DEFAULT NULL
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;`,
    getId: item => item.state,
    updateQuery: 'INSERT INTO `state_cases` (date, state, fips, cases, deaths) VALUES (?, ?, ?, ?, ?)',
    getUpdateParams: item => [item.date, item.state, item.fips, item.cases, item.deaths]
  });
};

const updateCountyData = async conn => {
  const csvUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
  await (0, _csvDataUpdater.default)({
    type: 'county',
    conn,
    csvUrl,
    latestDataQuery: `select CONCAT(county, state) as id, MAX(\`date\`) 
    as date from county_cases GROUP BY county, state`,
    schema: `CREATE TABLE IF NOT EXISTS \`county_cases\` (
      \`date\` date DEFAULT NULL,
      \`county\` varchar(50) DEFAULT NULL,
      \`state\` varchar(50) DEFAULT NULL,
      \`fips\` varchar(20) DEFAULT NULL,
      \`cases\` int(11) DEFAULT NULL,
      \`deaths\` int(11) DEFAULT NULL,
      KEY \`county_state_index\` (\`county\`,\`state\`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;`,
    getId: item => `${item.county}${item.state}`,
    updateQuery: 'INSERT INTO `county_cases` (date, county, state, fips, cases, deaths) VALUES (?, ?, ?, ?, ?, ?)',
    getUpdateParams: item => [item.date, item.county, item.state, item.fips, item.cases, item.deaths]
  });
};

const {
  host,
  username,
  password,
  database
} = config.get('db');

const CovimapDataUpdate = async jobData => {
  console.log(`\n[${new Date()}]Running CoviMapDataUpdate`, jobData);
  const conn = mysql.createConnection({
    host,
    user: username,
    password,
    database
  });

  try {
    await updateStateData(conn);
    await updateCountyData(conn);
    conn.end();
  } catch (err) {
    conn.end();
    throw err;
  }
};

var _default = CovimapDataUpdate;
exports.default = _default;