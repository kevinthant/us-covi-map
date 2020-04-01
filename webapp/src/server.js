import { getCountyMapData, getStateData, getHistoricalData } from './api';
const express = require('express');
var config = require('config');
const path = require('path');
const port = config.get('port');

const DIST_DIR = path.join(__dirname, "./../dist");
const STATIC_DIR = path.join(DIST_DIR, 'static');

var bodyParser = require('body-parser');

var customErrorHandler = function(errors, req, res){
    res.status(400);//You could choose a custom error code
    const [error] =  errors;
    res.json({message : error.message, stackTrace: error.stack });
};


const app = express();

app.use('/static', express.static(STATIC_DIR));
app.get('/', (req, res) => {
  return res.sendFile(DIST_DIR + '/index.html');
});

app.get('/historical', (req, res) => {
  return res.sendFile(DIST_DIR + '/historical.html');
});

app.get('/county/map.json', getCountyMapData);
app.get('/state/data.json', getStateData);
app.get('/historical/data.json', getHistoricalData);


app.use(bodyParser.json());
app.listen(port, () => {
    console.log('APIServer listening on port '+ port);
});

