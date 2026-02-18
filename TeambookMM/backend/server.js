const express = require('express');
const Datastore = require('@seald-io/nedb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4200;


app.use(cors());
app.use(express.json());

const db = new Datastore({
  filename: path.join(__dirname, 'database', 'pessoas.db'),
  autoload: true
});

app.get('/api/pessoas', (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      console.error('Erro ao listar:', err);
      return res.status(500).json({ erro: 'Erro ao buscar pessoas' });
    }
    res.json(docs);
  });
});

app.post('/api/pessoas', (req, res) => {
  const pessoa = req.body;

  if (!pessoa.nome || !pessoa.email || !pessoa.telefone) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  db.insert(pessoa, (err, newDoc) => {
    if (err) {
      console.error('Erro ao cadastrar:', err);
      return res.status(500).json({ erro: 'Erro ao cadastrar pessoa' });
    }
    res.status(201).json(newDoc);
  });
});

app.put('/api/pessoas/:id', (req, res) => {
  const id = req.params.id;
  const pessoaAtualizada = req.body;

  db.update(
    { _id: id },
    {
      $set: {
        nome: pessoaAtualizada.nome,
        email: pessoaAtualizada.email,
        telefone: pessoaAtualizada.telefone
      }
    },
    {},
    (err, numReplaced) => {
      if (err) {
        console.error('Erro ao atualizar:', err);
        return res.status(500).json({ erro: 'Erro ao atualizar pessoa' });
      }

      if (numReplaced === 0) {
        return res.status(404).json({ erro: 'Pessoa não encontrada' });
      }

      res.json({ mensagem: 'Pessoa atualizada com sucesso' });
    }
  );
});

app.delete('/api/pessoas/:id', (req, res) => {
  const id = req.params.id;

  db.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      console.error('Erro ao remover:', err);
      return res.status(500).json({ erro: 'Erro ao remover pessoa' });
    }

    if (numRemoved === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    res.json({ mensagem: 'Pessoa removida com sucesso' });
  });
});

app.listen(PORT, () => {
  console.log(`API rodando em: http://localhost:${PORT}`);
  console.log(`Banco NeDB: /database/pessoas.db`);
});
