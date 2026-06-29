import { ethers } from 'ethers';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'zkrollup',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');

const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../../deployments/addresses.json'), 'utf8'));
const rollupAddress = addresses.ZKRollupPayments;

const abi = [
  "event Deposited(address indexed user, uint256 amount)",
  "event BatchCommitted(uint256 indexed batchId, bytes32 newStateRoot, bytes32 batchHash)",
  "event Withdrawn(address indexed user, uint256 amount)"
];

const contract = new ethers.Contract(rollupAddress, abi, provider);

async function runIndexer() {
  console.log('Starting Indexer...');

  contract.on("Deposited", async (user, amount, event) => {
    try {
      await pool.query(
        "INSERT INTO deposits (user_address, amount, tx_hash) VALUES ($1, $2, $3) ON CONFLICT (tx_hash) DO NOTHING",
        [user, amount.toString(), event.log.transactionHash]
      );
      console.log(`Indexed deposit: ${user} ${amount}`);
    } catch (error) {
      console.error("Indexer error on Deposited:", error);
    }
  });

  // Additional listeners can be added here
}

runIndexer();
