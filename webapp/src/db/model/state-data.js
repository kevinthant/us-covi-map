import pool from './../pool';
import cache from './../cache';

export default {
  get: cache((query, { data: cacheData = [] } = {}) => {
    return pool.promise()
      .query(`select state, 
      MAX(cases) as cases, 
      MAX(deaths) as deaths,
      MAX(\`date\`) as \`asof\` 
      from state_cases 
      GROUP BY state 
      ORDER BY cases DESC;`)
      .then(([rows,fields]) => { 
        //when database is still updating in background, just reuse the cache
        if(rows.length < cacheData.length ) {
          return {
            data: cacheData,
            endTime: cache.TEN_MINS() // wait for next 10 mins to refetch
          };
        }

        return { 
          data: rows, 
          endTime: cache.NEXT_MINS(70) 
        };
      })
  })
};