"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("./../pool"));

var _cache = _interopRequireDefault(require("./../cache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const expandNewYorkCityCounty = (data, row) => {
  const {
    value,
    deaths,
    date
  } = row;
  data.push({
    county: 'New York (combined as whole New York City)',
    state: 'New York',
    fips: '36061',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Kings (combined as whole New York City)',
    state: 'New York',
    fips: '36047',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Queens (combined as whole New York City)',
    state: 'New York',
    fips: '36081',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Richmond (combined as whole New York City)',
    state: 'New York',
    fips: '36085',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Bronx (combined as whole New York City)',
    state: 'New York',
    fips: '36005',
    value,
    deaths,
    date
  });
};

const expandKansasCity = (data, row) => {
  const {
    value,
    deaths,
    date,
    state
  } = row;
  data.push({
    county: 'Jackson (combined as whole Kansas City)',
    state,
    fips: '29095',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Clay (combined as whole Kansas City)',
    state,
    fips: '29047',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Platte (combined as whole Kansas City)',
    state,
    fips: '29165',
    value,
    deaths,
    date
  });
  data.push({
    county: 'Cass (combined as whole Kansas City)',
    state,
    fips: '29037',
    value,
    deaths,
    date
  });
};

var _default = {
  get: (0, _cache.default)((query, {
    data: cacheData = []
  } = {}) => {
    return _pool.default.promise().query(`SELECT * from (select county, state, max(fips) as fips,
      MAX(cases) as \`value\`, MAX(deaths) as deaths, MAX(\`date\`) 
      as date from county_cases WHERE county <> 'Unknown' GROUP BY county, state) as a 
      ORDER BY state, county;`).then(([rows, fields]) => {
      //when database is still updating in background, just reuse the cache
      if (rows.length < cacheData.length) {
        return {
          data: cacheData,
          endTime: _cache.default.TEN_MINS() // wait for next 10 mins to refetch

        };
      }

      if (rows.length == 0) {
        return {
          data: [],
          endTime: _cache.default.TEN_MINS()
        };
      }

      const data = [];
      rows.forEach((row, i) => {
        if (row.county == 'New York City' && row.fips == '') {
          expandNewYorkCityCounty(data, row);
        } else if (row.county == 'Kansas City' && row.fips == '') {
          expandKansasCity(data, row);
        } else {
          data.push(row);
        }
      });
      return {
        data,
        endTime: _cache.default.NEXT_MINS(70)
      };
    });
  })
};
exports.default = _default;