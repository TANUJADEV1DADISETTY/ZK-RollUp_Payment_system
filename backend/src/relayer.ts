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
const privateKey = process.env.RELAYER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const wallet = new ethers.Wallet(privateKey, provider);

const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../../deployments/addresses.json'), 'utf8'));
const rollupAddress = addresses.ZKRollupPayments;

const abi = [
  "function commitBatch(bytes32 _oldStateRoot, bytes32 _newStateRoot, bytes32 _batchHash, bytes memory _proof, uint256[] memory _publicInputs) external",
  "function stateRoot() external view returns (bytes32)"
];
const contract = new ethers.Contract(rollupAddress, abi, wallet);

async function runRelayer() {
  console.log('Starting Relayer...');
  setInterval(async () => {
    try {
      const { rows: pending } = await pool.query("SELECT * FROM payment_intents WHERE status = 'pending'");
      if (pending.length === 0) return;

      console.log(`Found ${pending.length} pending intents. Committing batch...`);

      const oldStateRoot = await contract.stateRoot();
      // Dummy logic for calculating new state root and batch hash
      const newStateRoot = ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString()));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(pending)));
      const dummyProof = "0x01"; // Stub verifier accepts any non-empty bytes
      const publicInputs: any[] = [];

      const tx = await contract.commitBatch(oldStateRoot, newStateRoot, batchHash, dummyProof, publicInputs);
      await tx.wait();

      const { rows: batchRow } = await pool.query(
        "INSERT INTO batches (old_state_root, new_state_root, batch_hash, tx_hash) VALUES ($1, $2, $3, $4) RETURNING id",
        [oldStateRoot, newStateRoot, batchHash, tx.hash]
      );
      
      const batchId = batchRow[0].id;
      for (const intent of pending) {
        await pool.query("UPDATE payment_intents SET status = 'committed', batch_id = $1 WHERE id = $2", [batchId, intent.id]);
      }
      
      console.log(`Batch ${batchId} committed successfully.`);
    } catch (error) {
      console.error('Relayer error:', error);
    }
  }, 10000); // run every 10 seconds
}

runRelayer();
