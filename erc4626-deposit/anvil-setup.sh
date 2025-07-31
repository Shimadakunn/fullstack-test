#!/bin/bash

# Check if anvil is available
if ! command -v anvil &> /dev/null; then
    echo "Anvil not found. Please install Foundry first:"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "foundryup"
    exit 1
fi

# Start anvil in the background if not already running
if ! pgrep -f "anvil" > /dev/null; then
    echo "Starting Anvil..."
    anvil --host 0.0.0.0 --port 8545 --chain-id 31337 &
    ANVIL_PID=$!
    echo "Anvil started with PID: $ANVIL_PID"
    
    # Wait for anvil to be ready
    echo "Waiting for Anvil to be ready..."
    until curl -s -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8545 > /dev/null; do
        sleep 1
    done
    echo "Anvil is ready!"
else
    echo "Anvil is already running"
fi