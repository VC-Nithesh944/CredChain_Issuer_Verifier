# Blockchain Credential Verification System

## Prerequisites
- Node.js v18+
- MetaMask browser extension
- MongoDB (running locally on port 27017)

## Quickstart (5 Minutes)

1. **Start the local blockchain**
   Open Terminal 1:
   ```bash
   cd smart-contract
   npx hardhat node
   ```

2. **Deploy the contract**
   Open Terminal 2:
   ```bash
   cd smart-contract
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Start the application**
   Open Terminal 3:
   ```bash
   npm run dev
   ```

4. **Configure MetaMask**
   - Add Network: `http://127.0.0.1:8545` (Chain ID: 31337)
   - Import Account: Use Account #0 private key from the Hardhat node output

5. **Demo Steps**
   - Go to http://localhost:3000/issuer
   - Connect MetaMask
   - Issue a credential
   - Copy the Credential ID
   - Go to http://localhost:3000/verifier
   - Paste the ID and verify!
