import pool from './../pool';
import cache from './../cache';

export default {
  get: cache((query, { data: cacheData = [] } = {}) => {
    const { state = null, county = null } = query;
    if(!state  && !county) {
      return pool.promise()
        .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
        from state_cases 
        GROUP BY date ORDER BY date;`)
        .then(([rows, fields]) => {
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
        });
    } 
    
    if(state && !county) {
      return pool.promise()
        .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date
        from state_cases  
        WHERE state = ? 
        GROUP BY date ORDER BY date;`, [state])
        .then(([rows, fields]) => {
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
        });
    }

    return pool.promise()
      .query(`select SUM(cases) as cases, SUM(deaths) as deaths, date 
      from county_cases 
      WHERE state = ? AND county = ? 
      GROUP BY date ORDER BY date;`, [state, county])
      .then(([rows, fields]) => {
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
      });
  })
};