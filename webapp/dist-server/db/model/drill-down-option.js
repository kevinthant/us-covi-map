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
      state = null
    } = query;

    if (state) {
      return _pool.default.promise().query(`select county as \`option\` from county_cases WHERE state = ? GROUP BY county;`, [state]).then(([rows, f]) => {
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

    return _pool.default.promise().query(`select state as \`option\` from state_cases GROUP BY state;`).then(([rows, f]) => {
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