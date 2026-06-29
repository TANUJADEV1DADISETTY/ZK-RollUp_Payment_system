CREATE TABLE IF NOT EXISTS payment_intents (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(42) NOT NULL,
    recipient VARCHAR(42) NOT NULL,
    amount NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    batch_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_number INTEGER UNIQUE,
    old_state_root VARCHAR(66),
    new_state_root VARCHAR(66),
    batch_hash VARCHAR(66),
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deposits (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    amount NUMERIC NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
