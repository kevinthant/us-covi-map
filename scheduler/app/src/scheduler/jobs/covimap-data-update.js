const mysql = require('mysql2');
const config = require('config');
const rp =require('request-promise');
const csv=require('csvtojson');

const { host, username, password, database } = config.get('db');

const getData = (url) => {
  return new Promise((resolve, reject) => {
    rp(url)
    .then((str) => {
      csv()
      .fromString(str)
      .then(resolve)
      .catch(reject);
    })
    .catch(reject);
  });
};


const CovimapDataUpdate = async (jobData) => {
  console.log("\nGoing to fire to CoviMapDataUpdate for sending a new job", jobData);

  const countyDataUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
  const stateDataUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';

  const stateData =  await getData(stateDataUrl);
  const countyData = await getData(countyDataUrl);

  const conn = mysql.createConnection({
    host,
    user: username,
    password,
    database
  });

  try{

    await conn.promise()
      .execute(`CREATE TABLE IF NOT EXISTS \`state_cases\` (
        \`date\` date DEFAULT NULL,
        \`state\` varchar(50) DEFAULT NULL,
        \`fips\` varchar(20) DEFAULT NULL,
        \`cases\` int(11) DEFAULT NULL,
        \`deaths\` int(11) DEFAULT NULL
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8;`);

    await conn.promise()
      .execute('TRUNCATE TABLE `state_cases`;');

    let count = 0;
    await Promise.all(stateData.map((item) => {
      count++;
      return conn.promise()
      .execute('INSERT INTO `state_cases` (date, state, fips, cases, deaths) VALUES (?, ?, ?, ?, ?)', [
        item.date, item.state, item.fips, item.cases, item.deaths
      ]);
    }));

    console.log(`Updated State data, total = ${count}`);
    
    await conn.promise()
      .execute(`CREATE TABLE IF NOT EXISTS \`county_cases\` (
        \`date\` date DEFAULT NULL,
        \`county\` varchar(50) DEFAULT NULL,
        \`state\` varchar(50) DEFAULT NULL,
        \`fips\` varchar(20) DEFAULT NULL,
        \`cases\` int(11) DEFAULT NULL,
        \`deaths\` int(11) DEFAULT NULL,
        KEY \`county_state_index\` (\`county\`,\`state\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8;`);

    await conn.promise()
      .execute('TRUNCATE TABLE `county_cases`;');

    count = 0;
    await Promise.all(countyData.map((item) => {
      count++;
      return conn.promise()
      .execute('INSERT INTO `county_cases` (date, county, state, fips, cases, deaths) VALUES (?, ?, ?, ?, ?, ?)', [
        item.date, item.county, item.state, item.fips, item.cases, item.deaths
      ]);
    }));

    console.log(`Updated county data, total = ${count}`);

  } 
  catch(err) {
    conn.end();
    throw err;
  }
};


export default CovimapDataUpdate;