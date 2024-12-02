const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
const db = mysql.createPool({
  uri: 'mysql://root:BMRDuvXMizkAQEayQRFqlJCBINrjvCgW@autorack.proxy.rlwy.net:37284/railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para validar email
async function emailValido(email) {
  try {
    const [rows] = await db.query('select * from microservico_login where email = ?', [email]);
    return rows.length === 0;
  } catch (error) {
    console.error('Erro ao verificar email:', error.message);
    return false;
  }
}

// Cadastrar funcionário
async function cadastrarFuncionario(req, res) {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    const emailValidoBool = await emailValido(email);
    if (!emailValidoBool) {
      return res.status(400).json({ message: 'Email já em uso. Por favor, escolha outro email.' });
    }

    const sql = 'insert into microservico_login (nome, email, quantidade_vendas) VALUES (?, ?, 0)';
    await db.query(sql, [nome, email]);

    return res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar funcionário:', err.message);
    return res.status(500).json({ message: 'Erro ao cadastrar funcionário. Tente novamente mais tarde.' });
  }
}

async function atualizarFuncionario(req, res) {
  const { email } = req.params;
  const { nome, novoEmail } = req.body;

  try {
    const [rows] = await db.query('select * from microservico_login where email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    const sql = 'update microservico_login set nome = ?, email = ? where email = ?';
    await db.query(sql, [nome, novoEmail || email, email]);

    res.status(200).json({ message: 'Funcionário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error.message);
    res.status(500).json({ message: 'Erro ao atualizar funcionário.' });
  }
}

async function deletarFuncionario(req, res) {
  const { email } = req.params;

  try {
    const [result] = await db.query('delete from microservico_login where email = ?', [email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    res.status(200).json({ message: 'Funcionário deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error.message);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
}

async function getFuncionarios(req, res) {
  try {
    const [rows] = await db.query('select id, nome, email from microservico_login');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao obter funcionários:', err.message);
    res.status(500).json({ message: 'Erro ao obter funcionários.' });
  }
}

async function getFuncionariosByEmail(req, res) {
  const { email } = req.params;

  try {
    const [rows] = await db.query('select * from microservico_login where email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error.message);
    res.status(500).json({ message: 'Erro ao buscar funcionário.' });
  }
}


app.post('/api/cadastrar', cadastrarFuncionario);
app.put('/api/funcionarios/:email', atualizarFuncionario);
app.delete('/api/funcionarios/:email', deletarFuncionario);
app.get('/api/funcionarios', getFuncionarios);
app.get('/api/funcionarios/:email', getFuncionariosByEmail);

const port = process.env.PORT || 37284;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
