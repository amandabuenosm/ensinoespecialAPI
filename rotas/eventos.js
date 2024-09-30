const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');

const localarq = path.join(__dirname, '../db/eventos.json');

// leitura e escrita do arquivo
const leitura = (callback) => {
    fs.readFile(localarq, 'utf8', (erro, dados) => {
      if (erro) {
        console.error('Erro ao tentar ler o arquivo:', erro); 
        return callback(erro);
      }
      try {
        const eventos = JSON.parse(dados);
        callback(null, eventos);
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

// obter dados dos eventos
rota.get('/', (_req, res) => {
    leitura((erro, eventoslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos eventos.' });
      }
      res.status(200).json(eventoslist);
    });
});

// obter eventos por ID
rota.get('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, eventoslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos eventos.' });
      }
      const evento = eventoslist.find(a => a.id === id);
      if (!evento) {
        return res.status(404).json({ message: 'Evento não encontrado' });
      }
      res.status(200).json(evento);
    });
});

// criar um novo evento
rota.post('/', (req, res) => {
    const novoevento = req.body;
    if (!novoevento) {
      return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
    }
  
    leitura((erro, eventoslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos eventos.' });
      }
      
      // verificar se a lista de eventos está definida corretamente
      if (!Array.isArray(eventoslist)) {
        return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos eventos.' });
      }
  
      novoevento.id = String(Date.now());  // gerar um novo ID para o evento
      eventoslist.push(novoevento);
  
      escrita(eventoslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao gravar dados do novo evento.' });
        }
        res.status(201).json(novoevento);
      });
    });
});

// atualizar evento por ID
rota.put('/:id', (req, res) => {
    const id = req.params.id;
    const atualizados = req.body;
    leitura((erro, eventoslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos eventos.' });
      }
      const index = eventoslist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Evento não encontrado' });
      }
      eventoslist[index] = { ...eventoslist[index], ...atualizados };
      escrita(eventoslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao atualizar evento.' });
        }
        res.status(200).json(eventoslist[index]);
      });
    });
});

// deletar um evento por ID
rota.delete('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, eventoslist) => {
      if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos eventos.' });
      }
      const index = eventoslist.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Evento não encontrado' });
      }
      eventoslist.splice(index, 1);
      escrita(eventoslist, (erro) => {
        if (erro) {
          return res.status(500).json({ message: 'Erro ao excluir evento.' });
        }
        res.status(204).send(); 
      });
    });
});

// documentação do Swagger para incluir as novas rotas
/**
 * @swagger
 * tags: 
 *   name: Eventos
 *   description: Gestão de eventos
 */

/**
 * @swagger
 * /eventos:
 *   get:
 *     tags: 
 *       - Eventos
 *     summary: Retorna uma lista de eventos
 *     responses:
 *       200:
 *         description: Lista de eventos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: number
 *                   descricao:
 *                     type: string
 *                   comentarios:
 *                     type: string
 *                   data:
 *                     type: number
 *   post:
 *     tags: 
 *       - Eventos
 *     summary: Criar um novo evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                   id: 
 *                     type: number
 *                   descricao:
 *                     type: string
 *                   comentarios:
 *                     type: string
 *                   data:
 *                     type: number
 *     responses:
 *       201:
 *         description: Evento criado
 *
 * /eventos/{id}:
 *   get:
 *     tags: 
 *       - Eventos
 *     summary: Retornar evento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento não encontrado
 *   put:
 *     tags: 
 *       - Eventos
 *     summary: Atualiza um evento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evento atualizado
 *       404:
 *         description: Evento não encontrado
 *   delete:
 *     tags: 
 *       - Eventos
 *     summary: Deleta evento por ID
 *     parameters:
 *       - in: path 
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Evento deletado
 *       404:
 *         description: Evento não encontrado
 */

module.exports = rota;