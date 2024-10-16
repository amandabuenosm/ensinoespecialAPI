const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');

const localarq = path.join(__dirname, '../db/alunos.json'); 

// leitura e escrita do arquivo
const leitura = (callback) => {
  fs.readFile(localarq, 'utf8', (erro, dados) => {
    if (erro) {
      console.error('Erro ao tentar ler o arquivo:', erro); 
      return callback(erro);
    }
    try {
      const alunos = JSON.parse(dados);
      callback(null, alunos);
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

// obter dados dos alunos
rota.get('/', (_req, res) => {
  leitura((erro, alunoslist) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos alunos.' });
    }
    res.status(200).json(alunoslist);
  });
});

// obter alunos por ID
rota.get('/:id', (req, res) => {
  const id = req.params.id;
  leitura((erro, alunoslist) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos alunos.' });
    }
    const aluno = alunoslist.find(a => a.id === id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    res.status(200).json(aluno);
  });
});

// criar um novo aluno
rota.post('/', (req, res) => {
  const novoaluno = req.body;
  if (!novoaluno) {
    return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
  }

  leitura((erro, alunoslist) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos alunos.' });
    }
    
    // Verifique se a lista de alunos está definida corretamente
    if (!Array.isArray(alunoslist)) {
      return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos alunos.' });
    }

    novoaluno.id = String(Date.now());  
    alunoslist.push(novoaluno);

    escrita(alunoslist, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao gravar dados do novo aluno.' });
      }
      res.status(201).json(novoaluno);
    });
  });
});

// atualizar aluno por ID
rota.put('/:id', (req, res) => {
  const id = req.params.id;
  const atualizados = req.body;
  leitura((erro, alunoslist) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos alunos.' });
    }
    const index = alunoslist.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    alunoslist[index] = { ...alunoslist[index], ...atualizados };
    escrita(alunoslist, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao atualizar aluno.' });
      }
      res.status(200).json(alunoslist[index]);
    });
  });
});

// deletar um aluno por ID
rota.delete('/:id', (req, res) => {
  const id = req.params.id;
  leitura((erro, alunoslist) => {
    if (erro) {
      return res.status(500).json({ message: 'Erro na leitura dos dados dos alunos.' });
    }
    const index = alunoslist.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    alunoslist.splice(index, 1);
    escrita(alunoslist, (erro) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro ao excluir aluno.' });
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
 *     aluno:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *       properties:
 *         id:
 *           type: number
 *           description: ID do Aluno
 *         nome:
 *           type: string
 *           description: Nome do Aluno
 *         necessidade:
 *           type: string
 *           description: Necessidade do Aluno
 *       example:
 *         id: 6314
 *         nome: Julia Ferreiro de Oliveira
 *         necessidade: Síndrome de Tourette
 */

/**
 * @swagger
 * tags: 
 *   name: Alunos
 *   description: Gestão de alunos, por Amanda Gabrieli Bueno
 */

/**
 * @swagger
 * /alunos:
 *   get:
 *     tags: 
 *       - Alunos
 *     summary: Retorna uma lista de alunos
 *     responses:
 *       200:
 *         description: Lista de alunos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/aluno'
 *   post:
 *     tags: 
 *       - Alunos
 *     summary: Criar um novo aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/aluno'
 *     responses:
 *       201:
 *         description: Aluno criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/aluno'
 *
 * /alunos/{id}:
 *   get:
 *     tags: 
 *       - Alunos
 *     summary: Retornar aluno por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/aluno'
 *       404:
 *         description: Aluno não encontrado
 *   put:
 *     tags: 
 *       - Alunos
 *     summary: Atualiza um aluno por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/aluno'
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *       404:
 *         description: Aluno não encontrado
 *   delete:
 *     tags: 
 *       - Alunos
 *     summary: Deleta aluno por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do aluno
 *     responses:
 *       204:
 *         description: Aluno deletado
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/aluno'
 *       404:
 *         description: Aluno não encontrado
 */

module.exports = rota;
