const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');

const localarq = path.join(__dirname, '../db/professores.json');

// leitura e escrita do arquivo
const leitura = (callback) => {
    fs.readFile(localarq, 'utf8', (erro, dados) => {
      if (erro) {
        console.error('Erro ao tentar ler o arquivo:', erro); 
        return callback(erro);
      }
      try {
        const professores = JSON.parse(dados);
        callback(null, professores);
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

// obter dados dos professores
rota.get('/', (_req, res) => {
    leitura((erro, professoreslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos professores.' });
      }
      res.status(200).json(professoreslist);
    });
});

// obter professores por ID
rota.get('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, professoreslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos professores.' });
      }
      const professor = professoreslist.find(a => a.id === id);
      if (!professor) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      res.status(200).json(professor);
    });
});

// criar um novo professor
rota.post('/', (req, res) => {
    const novoprofessor = req.body;
    if (!novoprofessor) {
      return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
    }
  
    leitura((erro, professoreslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos professores.' });
      }
      
      // verificar se a lista de professores está definida corretamente
      if (!Array.isArray(professoreslist)) {
        return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos professores.' });
      }
  
      novoprofessor.id = String(Date.now());  // gerar um novo ID para o professor
      professoreslist.push(novoprofessor);
  
      escrita(professoreslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao gravar dados do novo professor.' });
        }
        res.status(201).json(novoprofessor);
      });
    });
});

// atualizar professor por ID
rota.put('/:id', (req, res) => {
    const id = req.params.id;
    const atualizados = req.body;
    leitura((erro, professoreslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos professores.' });
      }
      const index = professoreslist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      professoreslist[index] = { ...professoreslist[index], ...atualizados };
      escrita(professoreslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao atualizar professor.' });
        }
        res.status(200).json(professoreslist[index]);
      });
    });
});

// deletar um professor por ID
rota.delete('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, professoreslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos professores.' });
      }
      const index = professoreslist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Professor não encontrado' });
      }
      professoreslist.splice(index, 1);
      escrita(professoreslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao excluir professor.' });
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
 *     professor:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *       properties:
 *         id:
 *           type: number
 *           description: ID do professor
 *         nome:
 *           type: string
 *           description: Nome do professor
 *         disciplina:
 *           type: string
 *           description: Disciplina do professor
 *       example:
 *         id: 2102
 *         nome: Marcela Ferreira
 *         disciplina: Língua Portuguesa
 */

/**
 * @swagger
 * tags: 
 *   name: Professores
 *   description: Gestão de professores, por Kauany Paulino Francisco
 */

/**
 * @swagger
 * /professores:
 *   get:
 *     tags: 
 *       - Professores
 *     summary: Retorna uma lista de professores
 *     responses:
 *       200:
 *         description: Lista de professores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/professor'
 *   post:
 *     tags: 
 *       - Professores
 *     summary: Criar um novo professor
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/professor'
 *     responses:
 *       201:
 *         description: Professor criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/professor'
 *
 * /professores/{id}:
 *   get:
 *     tags: 
 *       - Professores
 *     summary: Retornar professor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do professor
 *     responses:
 *       200:
 *         description: Professor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/professor'
 *       404:
 *         description: Professor não encontrado
 *   put:
 *     tags: 
 *       - Professores
 *     summary: Atualiza um professor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/professor'
 *     responses:
 *       200:
 *         description: Professor atualizado
 *       404:
 *         description: Professor não encontrado
 *   delete:
 *     tags: 
 *       - Professores
 *     summary: Deleta professor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do professor
 *     responses:
 *       204:
 *         description: Professor deletado
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/professor'
 *       404:
 *         description: Professor não encontrado
 */

module.exports = rota;