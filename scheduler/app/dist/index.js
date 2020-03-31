"use strict";

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('config');

const port = config.get('port');

const swagger = require('swagger-express-router');

const SwaggerDocs = require('swagger-docs');

const SwaggerValidator = require('swagger-inputs-validator');

const swaggerDocument = require('./../swagger.json');

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
const app = (0, _express.default)();
app.get('/', (req, res) => {
  return res.redirect('/api-docs');
});
app.use(swaggerMiddleware.all());
const useBasePath = true; //whether to use the basePath from the swagger document when setting up the routes (defaults to false)

const middlewareObj = {
  'index': require('./controllers/index')
};
swagger.setUpRoutes(middlewareObj, app, swaggerDocument, useBasePath);
app.use(SwaggerDocs.middleWare(swaggerDocument, {
  path: '/api-docs'
}));
app.listen(port, () => {
  console.log('APIServer listening on port ' + port);
});