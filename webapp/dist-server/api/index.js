"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getDrillDownOptions = exports.getHistoricalData = exports.getStateData = exports.getCountyMapData = void 0;

var _pool = _interopRequireDefault(require("./../db/pool"));

var _countyMap = _interopRequireDefault(require("./../db/model/county-map"));

var _stateData = _interopRequireDefault(require("./../db/model/state-data"));

var _historicalData = _interopRequireDefault(require("./../db/model/historical-data"));

var _drillDownOption = _interopRequireDefault(require("./../db/model/drill-down-option"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getCountyMapData = (req, res) => {
  return _countyMap.default.get(req.query).then(data => res.json({
    data
  })).catch(error => res.json({
    error
  }));
};

exports.getCountyMapData = getCountyMapData;

const getStateData = (req, res) => {
  return _stateData.default.get(req.query).then(data => res.json({
    data
  })).catch(error => res.json({
    error
  }));
};

exports.getStateData = getStateData;

const getHistoricalData = (req, res) => {
  return _historicalData.default.get(req.query).then(data => res.json({
    rows: data
  })).catch(error => res.json({
    error
  }));
};

exports.getHistoricalData = getHistoricalData;

const getDrillDownOptions = (req, res) => {
  return _drillDownOption.default.get(req.query).then(data => res.json({
    rows: data
  })).catch(error => res.json({
    error
  }));
};

exports.getDrillDownOptions = getDrillDownOptions;
var _default = {
  getCountyMapData,
  getStateData,
  getHistoricalData,
  getDrillDownOptions
};
exports.default = _default;