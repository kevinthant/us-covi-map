
import pool from './../db/pool';

const getCountyMapData = (req, res) => {

  pool.promise()
    .query(`SELECT * from (select county, state, max(fips) as fips,
     MAX(cases) as \`value\`, MAX(deaths) as deaths, MAX(\`date\`) 
     as date from county_cases WHERE county <> 'Unknown' GROUP BY county, state) as a 
     ORDER BY state, county;`)
    .then( ([rows,fields]) => {
      
      if(rows.length == 0) {
        return resolve([]);
      }

      const data = [];
      rows.forEach((row, i) => {
        if(row.county == 'New York City' && row.fips == '') {
          const { value, deaths, date } = row;
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
        } 
        else if(row.county == 'Kansas City' && row.fips == '') {
          const { value, deaths, date, state } = row;
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
        }
        else {
          data.push(row);
        }
      });

      return res.json({ data });
    })
    .catch((error) => res.json({ error }));
};


const getStateData = (req, res) => {
  pool.promise()
    .query(`select state, 
    MAX(cases) as cases, 
    MAX(deaths) as deaths,
    MAX(\`date\`) as \`asof\` 
    from state_cases 
    GROUP BY state 
    ORDER BY cases DESC;`)
    .then(([rows,fields]) => { 
      res.json({ data: rows });
    })
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
        return pool.promise()
          .query(`select state as \`option\` from state_cases GROUP BY state;`)
          .then(([options, f]) => {
            res.json({ rows, options });
          });
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
        return pool.promise()
          .query(`select county as \`option\` from county_cases WHERE state = ? GROUP BY county;`, [state])
          .then(([options, f]) => {
            res.json({ rows, options });
          });
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

export {
  getCountyMapData,
  getStateData,
  getHistoricalData,
};

export default {
  getCountyMapData,
  getStateData,
  getHistoricalData,
}