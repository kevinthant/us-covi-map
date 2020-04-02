"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("./../pool"));

var _cache = _interopRequireDefault(require("./../cache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  get: (0, _cache.default)((query, {
    data: cacheData = []
  } = {}) => {
    const {
      state = null,
      county = null
    } = query;

    if (!state && !county) {
      return _pool.default.promise().query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
        from state_cases 
        GROUP BY date ORDER BY date;`).then(([rows, fields]) => {
        //when database is still updating in background, just reuse the cache
        if (rows.length < cacheData.length) {
          return {
            data: cacheData,
            endTime: _cache.default.TEN_MINS() // wait for next 10 mins to refetch

          };
        }

        return {
          data: rows,
          endTime: _cache.default.NEXT_MINS(70)
        };
      });
    }

    if (state && !county) {
      return _pool.default.promise().query(`select SUM(cases) as cases, SUM(deaths) as deaths, date
        from state_cases  
        WHERE state = ? 
        GROUP BY date ORDER BY date;`, [state]).then(([rows, fields]) => {
        //when database is still updating in background, just reuse the cache
        if (rows.length < cacheData.length) {
          return {
            data: cacheData,
            endTime: _cache.default.TEN_MINS() // wait for next 10 mins to refetch

          };
        }

        return {
          data: rows,
          endTime: _cache.default.NEXT_MINS(70)
        };
      });
    }

    return _pool.default.promise().query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
      from county_cases 
      WHERE state = ? AND county = ? 
      GROUP BY date ORDER BY date;`, [state, county]).then(([rows, fields]) => {
      //when database is still updating in background, just reuse the cache
      if (rows.length < cacheData.length) {
        return {
          data: cacheData,
          endTime: _cache.default.TEN_MINS() // wait for next 10 mins to refetch

        };
      }

      return {
        data: rows,
        endTime: _cache.default.NEXT_MINS(70)
      };
    });
  })
};
exports.default = _default;