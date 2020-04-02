
import pool from './../db/pool';
import CountyMapModel from './../db/model/county-map';
import StateDataModel from './../db/model/state-data';
import HistoricalDataModel from './../db/model/historical-data';
import DrillDownOptionModel from './../db/model/drill-down-option';

const getCountyMapData = (req, res) => {
  
  return CountyMapModel.get(req.query)
    .then((data) => res.json({ data }))
    .catch((error) => res.json({ error }));
};

const getStateData = (req, res) => {

  return StateDataModel.get(req.query)
    .then((data) => res.json({ data }))
    .catch((error) => res.json({ error }));
};

const getHistoricalData = (req, res) => {

  return HistoricalDataModel.get(req.query)
    .then((data) => res.json({ rows: data }))
    .catch((error) => res.json({ error }));
};

const getDrillDownOptions = (req, res) => {

  return DrillDownOptionModel.get(req.query)
    .then((data) => res.json({ rows: data }))
    .catch((error) => res.json({ error }));
};

export {
  getCountyMapData,
  getStateData,
  getHistoricalData,
  getDrillDownOptions,
};

export default {
  getCountyMapData,
  getStateData,
  getHistoricalData,
  getDrillDownOptions,
}