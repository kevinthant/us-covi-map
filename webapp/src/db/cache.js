
const md5 = require('md5');
const cache = (callback) => {
  const memoryStorage = {};
  return (query) => {
    const key = md5(JSON.stringify(query));
    if(memoryStorage[key] && memoryStorage[key].endTime > new Date()) {
      return Promise.resolve(memoryStorage[key].data);
    }
    
    return callback(query, memoryStorage[key])
    .then(({data, endTime }) => {
      memoryStorage[key] = { data, endTime };
      return data;
    });
  };
};

cache.TEN_MINS = () => new Date(new Date().getTime() + (10 * 60 * 1000));
cache.ONE_HOUR = () => new Date(new Date().getTime() + (60 * 60 * 1000));
cache.NEXT_MINS = (min) => new Date(new Date().getTime() + (min * 60 * 1000));

export default cache;