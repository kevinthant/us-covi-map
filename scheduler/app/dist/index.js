"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const express = require('express');

var config = require('config');

const port = config.get('port');

var bodyParser = require('body-parser');

const swagger = require('swagger-express-router');

const swaggerUi = require('swagger-ui-express');

const SwaggerValidator = require('swagger-inputs-validator');

const swaggerDocument = _objectSpread({}, require('./../swagger.json'), {
  host: 'localhost:' + (process.env.SWAGGER_PORT || port)
});

var customErrorHandler = function (errors, req, res) {
  res.status(400); //You could choose a custom error code

  const [error] = errors;
  res.json({
    message: error.message,
    stackTrace: error.stack
  });
};

const swaggerMiddleware = new SwaggerValidator(swaggerDocument, {
  onError: customErrorHandler
});
const app = express();
app.get('/', (req, res) => {
  return res.redirect('/api-docs');
});
app.use(bodyParser.json());
app.use(swaggerMiddleware.all());
const useBasePath = true; //whether to use the basePath from the swagger document when setting up the routes (defaults to false)

const middlewareObj = {
  'index': require('./controllers/index')
};
swagger.setUpRoutes(middlewareObj, app, swaggerDocument, useBasePath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log('APIServer listening on port ' + port);
});