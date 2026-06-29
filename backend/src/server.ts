import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'zkrollup',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

app.get('/state', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batches ORDER BY id DESC LIMIT 1');
    const stateRoot = rows.length > 0 ? rows[0].new_state_root : '0x0000000000000000000000000000000000000000000000000000000000000000';
    res.json({ stateRoot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/intents', async (req, res) => {
  const { sender, recipient, amount } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO payment_intents (sender, recipient, amount) VALUES ($1, $2, $3) RETURNING *',
      [sender, recipient, amount]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/history/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM payment_intents WHERE sender = $1 OR recipient = $1 ORDER BY id DESC',
      [address]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/batches', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batches ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
