const express = require('express');
var config = require('config');
const port = config.get('port');

var bodyParser = require('body-parser');
const swagger = require('swagger-express-router');
const swaggerUi = require('swagger-ui-express');
const SwaggerValidator = require('swagger-inputs-validator');
const swaggerDocument =  { ...require('./../swagger.json'), host: 'localhost:' + (process.env.SWAGGER_PORT || port )};

var customErrorHandler = function(errors, req, res){
    res.status(400);//You could choose a custom error code
    const [error] =  errors;
    res.json({message : error.message, stackTrace: error.stack });
};

const swaggerMiddleware = new SwaggerValidator(swaggerDocument, { onError: customErrorHandler });


const app = express();

app.get('/', (req, res) => {
    return res.redirect('/api-docs');
});

app.use(bodyParser.json());
app.use(swaggerMiddleware.all());

const useBasePath = true; //whether to use the basePath from the swagger document when setting up the routes (defaults to false)
const middlewareObj = {
    'index': require('./controllers/index'),
};
swagger.setUpRoutes(middlewareObj, app, swaggerDocument, useBasePath);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log('APIServer listening on port '+ port);
});


