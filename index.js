// bibliotecas obrigatórias
const express = require('express');
const cors = require('cors');
const swaggerjs = require('swagger-jsdoc');
const swaggerexp = require('swagger-ui-express');

// importação das rotas
const rotaalunos = require('./rotas/alunos');
const rotaagendamentos = require('./rotas/agendamentos');
const rotaeventos = require('./rotas/eventos');
const rotaprofessores = require('./rotas/professores');
const rotaprofissionais = require('./rotas/profissional');
const rotausuarios = require('./rotas/usuarios');

const app = express();
app.use(cors());
app.use(express.json()); 

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
  apis: ['./rotas/alunos.js', './rotas/agendamentos.js', './rotas/eventos.js', './rotas/professores.js', './rotas/profissional.js', './rotas/usuarios.js'],
};

// configuração do localhost
const swaggerconfig = swaggerjs(localswagger);
app.use('/api-docs', swaggerexp.serve, swaggerexp.setup(swaggerconfig));
app.use('/alunos', rotaalunos);
app.use('/agendamentos', rotaagendamentos);
app.use('/eventos', rotaeventos);
app.use('/professores', rotaprofessores);
app.use('/profissional', rotaprofissionais);
app.use('/usuarios', rotausuarios);

app.listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080');
});
