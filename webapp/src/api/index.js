
import pool from './../db/pool';
import CountyMapModel from './../db/model/county-map';
import StateDataModel from './../db/model/state-data';

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
  const { state = null, county = null } = req.query;
  if(!state  && !county) {
    return pool.promise()
      .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
      from state_cases 
      GROUP BY date ORDER BY date;`)
      .then(([rows, fields]) => {
        return res.json({ rows });
      })
      .catch((error) => res.json({ error }));
  } 
  
  if(state && !county) {
    return pool.promise()
      .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date
       from state_cases  
       WHERE state = ? 
       GROUP BY date ORDER BY date;`, [state])
      .then(([rows, fields]) => {
        return res.json({ rows });
      })
      .catch((error) => res.json({ error }));
  }

  return pool.promise()
    .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
    from county_cases 
    WHERE state = ? AND county = ? 
    GROUP BY date ORDER BY date;`, [state, county])
    .then(([rows, fields]) => {
      return res.json({ rows, options: null });
    })
    .catch((error) => res.json({ error }));
};

const getDrillDownOptions = (req, res) => {
  const { state = null } = req.query;

  if(state) {
    return pool.promise()
      .query(`select county as \`option\` from county_cases WHERE state = ? GROUP BY county;`, [state])
      .then(([rows, f]) => {
        res.json({ rows  });
      })
      .catch((error) => res.json({ error }));
  }

  return pool.promise()
      .query(`select state as \`option\` from state_cases GROUP BY state;`)
      .then(([rows, f]) => {
        res.json({ rows });
      })
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