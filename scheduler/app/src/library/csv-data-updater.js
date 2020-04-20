
const csv = require('csv-parser');
const downloader = require('receive-file');
const fs = require('fs');

const download = (url, filename) => {
  const options = {
      directory: "/tmp",
      filename: filename,
      timeout: 100000
  };

  return downloader(url, options);
};

const readCsvRow = async (url, rowUpdateCallback, onFinishCallback) => {
  const filename = url.split('/').pop();
  
  try{
    await download(url, filename);
    const readStream = fs.createReadStream(`/tmp/${filename}`)
      .pipe(csv());

      for await (const row of readStream) {
        await rowUpdateCallback(row);
      }

      onFinishCallback();
  } catch(err) {
    console.log("Error in getting data: ", err);
  }
};

const getLatestDateById = async (conn, query) => {
  const [rows,fields] = await conn.promise().query(query);

  const latestDateById = {};

  rows.forEach((row) => {
    latestDateById[row.id] = new Date(row.date).getTime();
  });

  return latestDateById;
};

const csvDataUpdater = async({ type, conn, csvUrl, latestDataQuery, schema, getId, updateQuery, getUpdateParams }) => {
  const latestDateById = await getLatestDateById(conn, latestDataQuery);

  await conn.promise()
    .execute(schema);

  let count = 0;
  await readCsvRow(csvUrl, async (item) => {
    if(latestDateById[getId(item)] >= new Date(item.date).getTime()) {
      return Promise.resolve(true);
    }
    
    count++;
    await conn.promise()
    .execute(updateQuery, getUpdateParams(item));
    
  }, () => {
    console.log(`Updated ${type} data, total = ${count}`)
  });
};

export default csvDataUpdater;
