const express = require('express');
const rota = express.Router();
const fs = require('fs');
const path = require('path');
const localarq = path.join(__dirname, '../db/usuarios.json');

// leitura e escrita do arquivo
const leitura = (callback) => {
    fs.readFile(localarq, 'utf8', (erro, dados) => {
        if (erro) {
            console.error('Erro ao tentar ler o arquivo:', erro); 
            return callback(erro);
        }
        try {
        const usuarios = JSON.parse(dados);
        callback(null, usuarios);
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

// obter dados dos usuarios
rota.get('/', (_req, res) => {
    leitura((erro, usuarioslist) => {
        if (erro) {
            return res.status(500).json({ message: 'Erro na leitura dos dados dos usuarios.' });
        }
        res.status(200).json(usuarioslist);
    });
});

// obter usuarios por ID
rota.get('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, usuarioslist) => {
    if (erro) {
        return res.status(500).json({ message: 'Erro na leitura dos dados dos usuarios.' });
    }
    const usuario = usuarioslist.find(a => a.id === id);
        if (!usuario) {
        return res.status(404).json({ message: 'usuario não encontrado' });
    }
    res.status(200).json(usuario);
    });
});

// criar um novo usuario
rota.post('/', (req, res) => {
    const novousuario = req.body;
    if (!novousuario) {
        return res.status(400).json({ message: 'Dados inválidos para inclusão!' });
    }

    leitura((erro, usuarioslist) => {
        if (erro) {
            return res.status(500).json({ message: 'Erro na leitura dos dados dos usuarios.' });
        }
    
    // Verifique se a lista de usuarios está definida corretamente
        if (!Array.isArray(usuarioslist)) {
            return res.status(500).json({ message: 'Formato inválido para arquivo JSON dos usuarios.' });
        }

        novousuario.id = String(Date.now());
        usuarioslist.push(novousuario);

        escrita(usuarioslist, (erro) => {
            if (erro) {
                return res.status(500).json({ message: 'Erro ao gravar dados do novo usuario.' });
            }
            res.status(201).json(novousuario);
        });
    });
});

// atualizar usuario por ID
rota.put('/:id', (req, res) => {
    const id = req.params.id;
    const atualizados = req.body;
    leitura((erro, usuarioslist) => {
        if (erro) {
            return res.status(500).json({ message: 'Erro na leitura dos dados dos usuarios.' });
        }
        const index = usuarioslist.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'usuario não encontrado' });
        }
        usuarioslist[index] = { ...usuarioslist[index], ...atualizados };
        escrita(usuarioslist, (erro) => {
            if (erro) {
                return res.status(500).json({ message: 'Erro ao atualizar usuario.' });
            }
            res.status(200).json(usuarioslist[index]);
        });
    });
});

// deletar um usuario por ID
rota.delete('/:id', (req, res) => {
    const id = req.params.id;
    leitura((erro, usuarioslist) => {
        if (erro) {
            return res.status(500).json({ message: 'Erro na leitura dos dados dos usuarios.' });
        }
        const index = usuarioslist.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'usuario não encontrado' });
        }
        usuarioslist.splice(index, 1);
        escrita(usuarioslist, (erro) => {
            if (erro) {
                return res.status(500).json({ message: 'Erro ao excluir usuario.' });
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
 *     usuario:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *       properties:
 *         id:
 *           type: number
 *           description: ID do Usuário
 *         nome:
 *           type: string
 *           description: Nome do Usuário
 *         usuario: 
 *           type: string
 *           description: Login do Usuário
 *       example:
 *         id: 7041
 *         nome: Pedro Soares
 *         usuario: PSoares21
 */

/**
 * @swagger
 * tags: 
 *   name: Usuários
 *   description: Gestão de usuários, por Airon Batista Furlanetto
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     tags: 
 *       - Usuários
 *     summary: Retorna uma lista de usuários
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/usuario'
 *   post:
 *     tags: 
 *       - Usuários
 *     summary: Criar um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/usuario'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/usuario'
 *
 * /usuarios/{id}:
 *   get:
 *     tags: 
 *       - Usuários
 *     summary: Retornar usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuario
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/usuario'
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     tags: 
 *       - Usuários
 *     summary: Atualiza um usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/usuario'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 *   delete:
 *     tags: 
 *       - Usuários
 *     summary: Deleta usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       204:
 *         description: Usuário deletado
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/usuario'
 *       404:
 *         description: Usuário não encontrado
 */

module.exports = rota;
