const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');

const localarq = path.join(__dirname, '../db/profissional.json'); 

// leitura e escrita do arquivo
const leitura = (callback) => {
  fs.readFile(localarq, 'utf8', (erro, dados) => {
    if (erro) {
      console.error('Erro ao tentar ler o arquivo:', erro); 
      return callback(erro);
    }
    try {
      const profissional = JSON.parse(dados);
      callback(null, profissional);
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

// obter dados dos profissionais
rota.get('/', (_req, res) => {
  leitura((erro, listaprofissionais) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos profissionais.' });
    }
    res.status(200).json(listaprofissionais);
  });
});

// obter profissionais por ID
rota.get('/:id', (req, res) => {
  const id = req.params.id;
  leitura((erro, listaprofissionais) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos profissionais.' });
    }
    const profissional = listaprofissionais.find(a => a.id === id);
    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }
    res.status(200).json(profissional);
  });
});

// criar um profissional
rota.post('/', (req, res) => {
  const novoprofissional = req.body;
  if (!novoprofissional) {
    return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
  }

  leitura((erro, listaprofissionais) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos profissionais.' });
    }
    
    // Verifique se a lista de profissionais está definida corretamente
    if (!Array.isArray(listaprofissionais)) {
      return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos profissionais.' });
    }

    novoprofissional.id = String(Date.now());  // Gera um novo ID para o profissional
    listaprofissionais.push(novoprofissional);

    escrita(listaprofissionais, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao gravar dados do novo profissional.' });
      }
      res.status(201).json(novoprofissional);
    });
  });
});

// atualizar profissionais por ID
rota.put('/:id', (req, res) => {
  const id = req.params.id;
  const atualizados = req.body;
  leitura((erro, listaprofissionais) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos profissionais.' });
    }
    const index = listaprofissionais.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }
    listaprofissionais[index] = { ...listaprofissionais[index], ...atualizados };
    escrita(listaprofissionais, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao atualizar profissional.' });
      }
      res.status(200).json(listaprofissionais[index]);
    });
  });
});

// deletar um profissional por ID
rota.delete('/:id', (req, res) => {
  const id = req.params.id;
  leitura((erro, listaprofissionais) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos profissionais.' });
    }
    const index = listaprofissionais.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }
    listaprofissionais.splice(index, 1);
    escrita(listaprofissionais, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao excluir profissional.' });
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
 *     profissional:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *       properties:
 *         id:
 *           type: number
 *           description: ID do profissional
 *         nome:
 *           type: string
 *           description: Nome do profissional
 *         especialidade:
 *           type: string
 *           description: Especialidade do profissional
 *       example:
 *         id: 4807
 *         nome: Paulo Marcelo de Farias
 *         especialidade: Médico
 */

/**
 * @swagger
 * tags: 
 *   name: Profissionais
 *   description: Gestão de profissionais, por Kauã Tereza de Oliveira
 */

/**
 * @swagger
 * /profissionais:
 *   get:
 *     tags: 
 *       - Profissionais
 *     summary: Retorna uma lista de profissionais
 *     responses:
 *       200:
 *         description: Lista de profissionais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/profissional'
 *   post:
 *     tags: 
 *       - Profissionais
 *     summary: Criar um novo profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/profissional'
 *     responses:
 *       201:
 *         description: Profissional criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profissional'
 * /profissional/{id}:
 *   get:
 *     tags: 
 *       - Profissionais
 *     summary: Retornar profissional por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Profissional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profissional'
 *       404:
 *         description: Profissional não encontrado
 *   put:
 *     tags: 
 *       - Profissionais
 *     summary: Atualiza um profissional por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/profissional'
 *     responses:
 *       200:
 *         description: Profissional atualizado
 *       404:
 *         description: Profissional não encontrado
 *   delete:
 *     tags: 
 *       - Profissionais
 *     summary: Deleta profissional por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do profissional
 *     responses:
 *       204:
 *         description: Profissional deletado
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/profissional'
 *       404:
 *         description: Profissional não encontrado
 */

module.exports = rota;
