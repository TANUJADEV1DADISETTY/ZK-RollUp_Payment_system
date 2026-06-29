import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let stateRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
const intents: any[] = [];
const batches: any[] = [];
let batchCounter = 1;

app.get('/state', (req, res) => {
  res.json({ stateRoot });
});

app.post('/intents', (req, res) => {
  const { sender, recipient, amount } = req.body;
  const intent = { id: intents.length + 1, sender, recipient, amount, status: 'pending' };
  intents.push(intent);
  res.json(intent);
});

app.get('/batches', (req, res) => {
  res.json(batches);
});

// Mock Relayer logic: runs every 5 seconds
setInterval(() => {
  const pending = intents.filter(i => i.status === 'pending');
  if (pending.length > 0) {
      console.log(`Mock Relayer committing ${pending.length} intents...`);
      pending.forEach(i => i.status = 'committed');
      
      const newRoot = '0x' + Math.random().toString(16).slice(2).padStart(64, '0');
      const batch = {
          id: batchCounter++,
          old_state_root: stateRoot,
          new_state_root: newRoot,
          tx_hash: '0x' + Math.random().toString(16).slice(2).padStart(64, 'a')
      };
      
      batches.push(batch);
      stateRoot = newRoot;
  }
}, 5000);

app.listen(3001, () => {
  console.log('Mock Backend Server running on port 3001');
});
