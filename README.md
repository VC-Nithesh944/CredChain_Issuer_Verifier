# CredChain

CredChain is a blockchain-based credential issuance and verification system.
It lets authorized issuers create credentials, anchors proofs on-chain, and allows public verification.

## What This Project Does

- Issues credentials from an issuer portal
- Stores credential records in MongoDB (and optionally IPFS)
- Anchors credential proof (hash + metadata) on Ethereum via smart contract
- Verifies credentials in a verifier portal using DB + blockchain cross-checking

## Why This Exists

Traditional credentials are easy to forge and hard to verify globally.
CredChain demonstrates a trust model where:

- issuer identity is controlled by on-chain authorization
- credential integrity is checked with cryptographic hashes
- proof is immutable once written on-chain
- verification is public and deterministic

## Core Trust Model

Credibility is enforced by multiple layers:

1. Issuer authorization: only registered issuers can issue on-chain
2. Hash integrity: any payload change creates a different hash
3. Blockchain immutability: issued proof cannot be silently edited
4. Wallet signing: issuance transactions are signed by issuer wallets
5. Cross-checking: verifier compares database record with on-chain proof

## Repository Structure

- `issuer-portal/` - issuer UI (issue flow, admin issuer management)
- `verifier-app/` - verifier UI (search, status, trust checks)
- `backend/` - API, MongoDB persistence, stats, optional IPFS upload
- `smart-contract/` - Solidity contract, deploy script, tests
- `server.js` - root reverse proxy for issuer, verifier, and API

## Verification Outcomes

Verifier uses explicit states:

- `Verified`: on-chain record exists and hash matches DB
- `Not on Chain`: DB record exists, but no matching on-chain issuance
- `Tampered`: on-chain record exists, but hash does not match DB
- `Not Found`: no DB record for the credential ID
- `Blockchain Offline`: chain unavailable; DB-only fallback shown

## Credentials Secured Counter

`Network Stats -> Credentials Secured` counts only **authentic on-chain credentials**,
not the total number of records in MongoDB.

## Local Setup

### Prerequisites

- Node.js v18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)
- MetaMask browser extension

### Install

```bash
npm install
```

### Run Locally

1. Start local blockchain:

```bash
cd smart-contract
npx hardhat node
```

2. Deploy contract (writes config used by backend and issuer portal):

```bash
cd smart-contract
npx hardhat run scripts/deploy.js --network localhost
```

3. Start full app from repo root:

```bash
npm run dev
```

4. Open:

- Issuer portal: `http://localhost:3000/issuer`
- Verifier portal: `http://localhost:3000/verifier`

### MetaMask (Local Network)

- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Import Hardhat accounts as needed

## Environment (Backend)

Use `backend/.env` with at least:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/credential_registry
PORT=4000
PINATA_JWT=
NETWORK=localhost
```

Notes:

- `PINATA_JWT` can be empty for local demo (mock IPFS mode)
- root template keys like `GEMINI_API_KEY` / `APP_URL` are not required for credential flow

## Demo Scenarios (Recommended)

1. Verified flow

- Register issuer from admin wallet
- Issue credential
- Verify -> `Verified`

2. Not on Chain flow

- Save record off-chain, fail blockchain issuance
- Verify -> `Not on Chain`

3. Tampered flow

- Issue credential
- Modify stored hash in MongoDB
- Verify -> `Tampered`

4. Not Found flow

- Query unknown or deleted credential ID
- Verify -> `Not Found`

5. Unauthorized issuer flow

- Attempt issuance with unregistered wallet
- Contract rejects issuance

## Why Some Failed Issuances Still Appear In DB

Current flow saves the credential record before blockchain confirmation.
If on-chain issuance fails afterward, the DB record can still exist.
That is why `Not on Chain` is a separate status.

## README Best-Practice Checklist

A good project README should include only essentials:

- What the project is
- Why it exists
- How to run it quickly
- Required configuration
- Key architecture/flows
- Security/trust assumptions
- Known statuses/failure modes
- Minimal demo steps

This README follows that structure to stay useful and maintainable.

## License

Demo/reference implementation.
