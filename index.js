// bibliotecas obrigatórias
const express = require('express');
const swaggerjs = require('swagger-jsdoc');
const swaggerexp = require('swagger-ui-express');
const cors = require('cors');

const rotaalunos = require('./rotas/alunos'); // importar a rota dos alunos

const app = express();
app.use(cors());

// configuração do Swagger
const localswagger = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestão de Ensino Especial API',
      version: '1.0.0',
      description: 'API para gerenciamento de professores, alunos, eventos, agendamentos de saúde e mais.',
      servers: {
          url: 'http://localhost:8080',
        },
    },
  },
  apis: ['./rotas/alunos.js'],
};

// configuração do localhost
const swaggerconfig = swaggerjs(localswagger);
app.use('/api-docs', swaggerexp.serve, swaggerexp.setup(swaggerconfig));
app.use('/alunos', rotaalunos);
app.listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080');
});