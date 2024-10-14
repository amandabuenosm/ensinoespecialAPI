const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');

const localarq = path.join(__dirname, '../db/agenda.json');

// leitura e escrita do arquivo
const leitura = (callback) => {
    fs.readFile(localarq, 'utf8', (erro, dados) => {
      if (erro) {
        console.error('Erro ao tentar ler o arquivo:', erro); 
        return callback(erro);
      }
      try {
        const agendamentos = JSON.parse(dados);
        callback(null, agendamentos);
      } catch (erro) {
        console.error('Erro ao parsear o arquivo JSON:', erro);
        callback(erro);
      }
    });
};

const escrita = (dados, callback) => {
    fs.writeFile(localarq, JSON.stringify(dados, null, 2), (erro) => {
      if (erro) {
        return callback(erro);
      }
      callback(null);
    });
};

// obter dados dos agendamentos
rota.get('/', (_req, res) => {
    leitura((erro, agendalist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos agendamentos.' });
      }
      res.status(200).json(agendalist);
    });
});

// obter agendamentos por ID
rota.get('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, agendalist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos agendamentos.' });
      }
      const agendamento = agendalist.find(a => a.id === id);
      if (!agendamento) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      res.status(200).json(agendamento);
    });
});

// criar um novo agendamento
rota.post('/', (req, res) => {
    const novoagendamento = req.body;
    if (!novoagendamento) {
      return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
    }
  
    leitura((erro, agendalist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos agendamentos.' });
      }
      
      // verificar se a lista de agendamentos está definida corretamente
      if (!Array.isArray(agendalist)) {
        return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos agendamentos.' });
      }
  
      novoagendamento.id = String(Date.now()); 
      agendalist.push(novoagendamento);
  
      escrita(agendalist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao gravar dados do novo agendamento.' });
        }
        res.status(201).json(novoagendamento);
      });
    });
});

// atualizar agendamentos por ID
rota.put('/:id', (req, res) => {
    const id = req.params.id;
    const atualizados = req.body;
    leitura((erro, agendalist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos agendamentos.' });
      }
      const index = agendalist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      agendalist[index] = { ...agendalist[index], ...atualizados };
      escrita(agendalist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
        }
        res.status(200).json(agendalist[index]);
      });
    });
});

// deletar um agendamento por ID
rota.delete('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, agendalist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos agendamentos.' });
      }
      const index = agendalist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }
      agendalist.splice(index, 1);
      escrita(agendalist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao excluir agendamento.' });
        }
        res.status(204).send(); 
      });
    });
});

// documentação do Swagger para incluir as novas rotas
/**
 * @swagger
 * components:
 *   schemas:
 *     agendamento:
 *       type: object
 *       required:
 *         - id
 *         - especialista
 *       properties:
 *         id:
 *           type: number
 *           description: ID do agendamento
 *         especialista:
 *           type: string
 *           description: Descrição do especialista
 *         profissional:
 *           type: string
 *           description: Nome do especialista
 *       example:
 *         id: 174452
 *         especialista: Psicólogo
 *         profissional: Fabiana Nunes
 */

/**
 * @swagger
 * tags: 
 *   name: Agendamentos
 *   description: Gestão de agendamentos, por Amanda Gabrieli Bueno
 */
/**
 * @swagger
 * /agendamentos:
 *   get:
 *     tags: 
 *       - Agendamentos
 *     summary: Retorna uma lista de agendamentos
 *     responses:
 *       200:
 *         description: Lista de agendamentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/agendamento'
 *   post:
 *     tags: 
 *       - Agendamentos
 *     summary: Criar um novo agendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/agendamento'
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/agendamento'
 *
 * /agendamentos/{id}:
 *   get:
 *     tags: 
 *       - Agendamentos
 *     summary: Retornar agendamento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do agendamento
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/agendamento'
 *       404:
 *         description: Agendamento não encontrado
 *   put:
 *     tags: 
 *       - Agendamentos
 *     summary: Atualiza um agendamento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do agendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/agendamento'
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *       404:
 *         description: Agendamento não encontrado
 *   delete:
 *     tags: 
 *       - Agendamentos
 *     summary: Deleta agendamentos por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do agendamento
 *     responses:
 *       204:
 *         description: Agendamento deletado
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/agendamento'
 *       404:
 *         description: Agendamento não encontrado
 */

module.exports = rota;
