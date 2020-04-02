import pool from './../pool';
import cache from './../cache';

export default {
  get: cache((query, { data: cacheData = [] } = {}) => {
    const { state = null } = query;
    if(state) {
      return pool.promise()
        .query(`select county as \`option\` from county_cases WHERE state = ? GROUP BY county;`, [state])
        .then(([rows, f]) => {
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
      .query(`select state as \`option\` from state_cases GROUP BY state;`)
      .then(([rows, f]) => {
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