const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

let url = 'http://localhost:3000';
let description = 'Development server';

if(process.env.NODE_ENV !== 'development'){
    url = process.env.CLIENT_HOST;
    description = 'Production server';
}

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Sky Flow Documentation' ,
        version: '1.0.0',
        description:
            'This is a REST API application made with Express. It retrieves data from a MongoDB database and applies CRUD operations on it.',
    },
    servers: [
        {
            url: url,
            description: description,
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}