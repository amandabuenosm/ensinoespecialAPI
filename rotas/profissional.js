// bibliotecas obrigatórias para a rota
const express = require('express');
const rota = express.Router();
const fs = require('fs');
const run = require('path');

// docuentação do swagger (deve conter os tipos de dados usados)
/**
 * @swagger
 * /profissional:
 *   get:
 *     description: Documentação dos profissionais de saúde
 *     responses:
 *       200:
 *         description: Lista de profissionais de saúde
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: number
 *                   nome:
 *                     type: string
 *                   especialidade:
 *                     type: string
 *                   NRP:
 *                     type: string
 *                   email:
 *                     type: string
 *                   telefone:
 *                     type: number
 *                   status:
 *                     type: string
 */
rota.get('/', (_req, res) => {

  const localarq = run.join(__dirname, '../db/profissional.json'); // localização do arquivo com os dados

  fs.readFile(localarq, 'utf8', (erroleitura, dados) => { // faz a leitura do arquivo json
    if (erroleitura) { // se houver problemas, retorna a resposta de erro e a mensagem 
      console.error('Erro ao fazer a leitura do arquivo dos profissionais:', erroleitura);
      return res.status(500).json({ message: 'Erro ao ler arquivo dos dados de profissionais!' });
    }

    try {
      const listaprofissional = JSON.parse(dados); // converte os dados do arquivo em json e armazena em outra variável
      res.status(200).json(listaprofissional);
    } catch (erroprocesso) { // caso haja problema na conversão e no processamento dos dados, retorna um erro
      console.error('Erro ao fazer análise do arquivo JSON:', erroprocesso);
      res.status(500).json({ message: 'Erro ao reprocessar dados do arquivo de profissionais.json!' });
    }
  });
});

module.exports = rota;