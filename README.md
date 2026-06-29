# ZK-Rollup Payment System

A full-stack **ZK-Rollup-inspired Payment System** built using **Solidity, Hardhat, Node.js, Express.js, Ethers.js, PostgreSQL, Flutter, Docker, and TypeScript**.

This project demonstrates a simplified Layer-2 Rollup architecture where off-chain payment intents are batched by a relayer and committed on-chain while maintaining an indexed database for efficient querying.

---

# Features

- Smart contract for deposits, withdrawals, and batch commitments
- Stub ZK Verifier for proof verification simulation
- Hardhat local blockchain deployment
- Express.js REST API
- PostgreSQL database with automated migrations
- Relayer worker for batching pending payment intents
- Blockchain indexer using ethers.js event listeners
- Flutter Web Wallet
- Dockerized application
- Automated validation script
- End-to-end payment workflow

---

# Technology Stack

## Blockchain

- Solidity
- Hardhat
- Ethers.js

## Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- TypeScript

## Frontend

- Flutter
- Dart
- HTTP Package
- go_router

## DevOps

- Docker
- Docker Compose

---

# Project Structure

```text
zk-rollup-payment-system/
│
├── contracts/
│   ├── interfaces/
│   │   └── IZKVerifier.sol
│   ├── StubZKVerifier.sol
│   └── ZKRollupPayments.sol
│
├── backend/
│   ├── migrations/
│   ├── src/
│   │   ├── app.ts
│   │   ├── db.ts
│   │   ├── relayer.ts
│   │   ├── indexer.ts
│   │   ├── routes/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
│
├── flutter_app/
│   ├── lib/
│   │   ├── screens/
│   │   ├── services/
│   │   └── widgets/
│   ├── Dockerfile
│   └── pubspec.yaml
│
├── deployments/
│   └── addresses.json
│
├── scripts/
│   ├── deploy.js
│   └── validate.js
│
├── hardhat.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# System Architecture

```
                 +----------------------+
                 |   Flutter Wallet     |
                 +----------+-----------+
                            |
                        REST API
                            |
                            v
              +-----------------------------+
              |    Express.js Backend       |
              +-----------+-----------------+
                          |
          +---------------+----------------+
          |                                |
          |                                |
          v                                v
 PostgreSQL Database              Relayer Worker
          |                                |
          |                                |
          |                                v
          |                    ZKRollupPayments Contract
          |                                |
          +------------ Indexer -----------+
                           |
                           v
                  Hardhat Blockchain
```

---

# Workflow

## Step 1: Deposit

1. User deposits ETH into the smart contract.
2. Deposit event is emitted.
3. Indexer listens for the event.
4. Deposit is stored in PostgreSQL.

---

## Step 2: Payment Intent

1. User opens Flutter Wallet.
2. Enters receiver address.
3. Enters amount.
4. Backend checks on-chain deposited balance.
5. If sufficient, a pending payment intent is created.

---

## Step 3: Relayer

Every 15 seconds:

- Fetch pending intents
- Create batch
- Compute batch hash
- Compute new state root
- Call commitBatch()
- Update database

---

## Step 4: Smart Contract

The contract

- verifies proof
- updates state root
- increments batch count
- stores batch information
- emits BatchCommitted event

---

## Step 5: Indexer

The indexer listens to

- Deposited
- BatchCommitted
- Withdrawn

events and updates PostgreSQL.

---

# Smart Contracts

## IZKVerifier.sol

Defines the interface

```solidity
function verifyProof(
    bytes calldata proof,
    uint256[] calldata publicInputs
) external view returns(bool);
```

---

## StubZKVerifier.sol

Implements the verifier.

Always returns

```solidity
true;
```

---

## ZKRollupPayments.sol

Contains

- deposit()
- withdraw()
- commitBatch()
- addRelayer()
- removeRelayer()
- isRelayer()

---

# Backend APIs

## POST /intents

Creates a payment intent.

Validates deposited balance using the smart contract.

Response

```json
{
  "intentId": "...",
  "status": "pending"
}
```

---

## GET /intents

Returns payment intents.

Supports filters

- address
- status

---

## GET /batches

Returns all committed batches.

---

## GET /batches/:batchIndex

Returns

- batch details
- associated payment intents

---

## GET /deposits/:address

Returns deposited balance.

---

## GET /state

Returns

- current state root
- batch count
- contract address

---

# Database Schema

## payment_intents

Stores

- sender
- receiver
- amount
- batch id
- status

---

## batches

Stores

- batch hash
- state roots
- relayer
- transaction hash

---

## deposits

Stores

- user deposits
- transaction hash
- block number

---

# Relayer

Runs every 15 seconds.

Responsibilities

- fetch pending intents
- create batch
- compute hashes
- commit batch
- update payment status

Possible status flow

```
pending
   ↓
batched
   ↓
committed
```

Failure flow

```
pending
   ↓
failed
```

---

# Indexer

Uses

```javascript
ethers.provider.on(...)
```

to listen for

- Deposited
- BatchCommitted
- Withdrawn

events.

---

# Flutter Screens

## Dashboard

Displays

- wallet balance
- state root
- batch count

---

## Send Payment

Allows users to

- enter recipient
- enter amount
- submit payment

---

## Transaction History

Displays

- pending
- batched
- committed
- failed

Supports address filtering.

---

## Batch Explorer

Displays

- batch list
- batch details
- included payment intents

---

# Docker Services

The application contains five services

- hardhat
- postgres
- deployer
- backend
- flutter

Startup order

```
Hardhat
   ↓
Deployer
   ↓
Backend
   ↓
Flutter
```

---

# Environment Variables

Copy

```
.env.example
```

to

```
.env
```

Variables

```
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
DATABASE_URL

API_PORT

RPC_URL

RELAYER_PRIVATE_KEY

USER_A_PRIVATE_KEY
USER_A_ADDRESS
USER_B_ADDRESS
```

---

# Installation

Clone repository

```bash
git clone <repository-url>
cd zk-rollup-payment-system
```

Copy environment variables

```bash
cp .env.example .env
```

Run Docker

```bash
docker-compose up --build
```

---

# Manual Setup

Install packages

```bash
npm install
```

Compile contracts

```bash
npx hardhat compile
```

Run local blockchain

```bash
npx hardhat node
```

Deploy contracts

```bash
node scripts/deploy.js
```

Run backend

```bash
cd backend
npm install
npm start
```

Run Flutter

```bash
cd flutter_app
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:4000
```

---

# Validation

Execute

```bash
node scripts/validate.js
```

The validation performs

- Deposit test
- Indexer validation
- Valid payment submission
- Invalid payment submission
- Relayer processing
- Batch verification
- API verification

A file named

```
validation_report.json
```

is generated automatically.

---

# Security

- Only authorized relayers can commit batches.
- Contract ownership is protected.
- Private keys are stored in environment variables.
- Backend validates all requests.
- On-chain deposit balance is verified before creating payment intents.

---

# Future Improvements

- Real Zero-Knowledge Proofs
- Merkle Tree State Updates
- Decentralized Relayer Network
- Redis Queue
- JWT Authentication
- CI/CD Pipeline
- Kubernetes Deployment
- Account Abstraction
- ERC-4337 Wallet Support

---

# Testing

Smart Contract

- Deposit
- Withdraw
- Commit Batch
- Relayer Authorization

Backend

- REST APIs
- Database
- Relayer
- Indexer

Frontend

- Dashboard
- Send Payment
- History
- Batch Explorer

Validation

- Complete end-to-end workflow

---

# License

This project is developed for educational purposes to demonstrate the architecture of a Layer-2 ZK-Rollup payment system. The implementation uses a stub verifier instead of a real zero-knowledge proof system and is not intended for production use.
