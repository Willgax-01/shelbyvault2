# 🧠 ShelbyVault 2.0 — AI Memory Storage

> Permanent decentralized memory layer for autonomous AI agents, built on [Shelby Protocol](https://shelby.xyz) × Aptos blockchain.

![ShelbyVault 2.0](https://img.shields.io/badge/ShelbyVault-2.0-00FF88?style=for-the-badge&labelColor=03050A)
![Shelby Protocol](https://img.shields.io/badge/Shelby-Testnet-0EA5E9?style=for-the-badge&labelColor=03050A)
![Aptos](https://img.shields.io/badge/Aptos-Blockchain-A855F7?style=for-the-badge&labelColor=03050A)
![Live](https://img.shields.io/badge/Live-shelbyvault2.vercel.app-00FF88?style=for-the-badge&labelColor=03050A)

---

## What is ShelbyVault 2.0?

ShelbyVault 2.0 is an **AI memory vault** — a permanent, decentralized storage layer for AI agents. Think of it as a hard drive for AI brains.

Instead of AI agent outputs disappearing after a session, ShelbyVault stores them **on-chain forever** via Shelby Protocol's decentralized blob storage on Aptos.

### What can agents store?

| Type | Description |
|------|-------------|
| 🧠 **Reasoning** | Chain-of-thought, internal agent reasoning, confidence scores |
| 🎨 **Image** | AI-generated visuals (Seedream 3.0) or uploaded images |
| 📋 **Log** | Agent execution logs, events, status tracking |
| ⚡ **Decision** | Autonomous agent decisions with full reasoning trail |
| 🔬 **Research** | Research outputs, findings, sources, key takeaways |
| 💾 **Checkpoint** | Model state, version snapshots, training checkpoints |
| 📁 **File** | Any file type — PDF, video, audio, ZIP, JSON, binary |

---

## Features

- **Store anything** — text, JSON, images, files, logs, decisions — all 7 memory types
- **On-chain proof** — every memory gets a transaction hash on Aptos Testnet
- **AI image gen** — generate images with Seedream 3.0 (ByteDance) and store them instantly
- **Memory Vault** — browse, filter, and search all stored memories
- **Agent API** — any AI agent can POST memories via HTTP in one call
- **Shelby Explorer** — verify every stored blob on-chain
- **Mobile ready** — full responsive UI with bottom nav bar

---

## Live Demo

🌐 **[shelbyvault2.vercel.app](https://shelbyvault2.vercel.app)**

---

## Agent API

Any AI agent can store memories with a simple HTTP POST:

```js
// JavaScript / Node.js
const response = await fetch('https://shelbyvault2.vercel.app/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name:        'agent-reasoning-001',
    memoryType:  'reasoning',   // reasoning | image | log | decision | research | checkpoint | file
    imageBase64: 'data:text/plain;base64,' + btoa(content),
    filename:    'reasoning-001.txt',
    agentId:     'gpt-4-turbo',
    tags:        ['production', 'chain-of-thought']
  })
})
const { blobName, txHash, explorerUrl } = await response.json()
```

```python
# Python — works with LangChain, AutoGen, CrewAI...
import requests, base64

requests.post('https://shelbyvault2.vercel.app/api/upload', json={
    'name':        f'decision-{agent_id}',
    'memoryType':  'decision',
    'imageBase64': 'data:text/plain;base64,' + base64.b64encode(content.encode()).decode(),
    'filename':    f'decision-{agent_id}.txt',
    'agentId':     agent_id,
    'tags':        ['autonomous', 'production']
})
```

### Response
```json
{
  "success":     true,
  "blobName":    "agent-reasoning-001_1234567890.txt",
  "size":        "2.4 KB",
  "txHash":      "0x4b858271b019cc711e6906e34104ee0ca8db...",
  "explorerUrl": "https://explorer.shelby.xyz/testnet/blobs/0x18d0...",
  "aptosUrl":    "https://explorer.aptoslabs.com/txn/0x4b85...?network=testnet"
}
```

### Memory Types Reference

| `memoryType` | Required Fields | Description |
|-------------|----------------|-------------|
| `reasoning` | content text | Chain of thought + conclusion + confidence |
| `image` | base64 image data | PNG/JPG image blob |
| `log` | content text | Event log with status + timestamp |
| `decision` | content text | Decision + reasoning + alternatives |
| `research` | content text | Topic + findings + sources + takeaways |
| `checkpoint` | content text | Model name + version + state |
| `file` | any base64 data | Any file type, any size |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Storage** | [Shelby Protocol](https://shelby.xyz) decentralized blob storage |
| **Blockchain** | Aptos Testnet |
| **Image AI** | Seedream 3.0 via Puter.js (ByteDance / Together AI) |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Frontend** | Vanilla HTML/CSS/JS — zero framework dependencies |
| **SDK** | `@shelby-protocol/sdk` + `@aptos-labs/ts-sdk` |

---

## Project Structure

```
shelbyvault2/
├── public/
│   └── index.html      ← Full dashboard UI (vanilla JS, no framework)
├── api/
│   └── upload.js       ← Memory storage serverless function
├── package.json        ← includes got@^12.6.1 (required by Shelby SDK)
├── vercel.json         ← routing config
├── .npmrc              ← legacy-peer-deps=true
└── README.md
```

---

## Deploy Your Own

### 1. Clone & push to GitHub
```bash
git clone https://github.com/Willgax-01/shelbyvault2
cd shelbyvault2
```

### 2. Deploy to Vercel
Import the repo on [vercel.com/new](https://vercel.com/new) and add these environment variables:

| Variable | Value |
|----------|-------|
| `SHELBY_PRIVATE_KEY` | `ed25519-priv-0x...` your Aptos wallet private key (AIP-80 format) |
| `SHELBY_API_KEY` | `aptoslabs_...` your Shelby / Geomi API key |

### 3. Get Shelby testnet access
- Sign up at [geomi.xyz](https://geomi.xyz) for a Shelby API key
- Create an Aptos wallet and fund it with testnet SHELBY tokens
- Use the Aptos testnet faucet for APT gas fees

---

## How It Works

```
User / Agent
    │
    ▼
POST /api/upload
    │
    ├── 1. Decode base64 blob data
    ├── 2. Build Aptos transaction (register_blob on-chain)
    ├── 3. Sign + submit tx → Aptos Testnet
    ├── 4. PUT blob data → Shelby RPC node
    │
    ▼
Returns: txHash + Shelby Explorer URL + Aptos Explorer URL
```

---

## Built for

**Shelby Protocol Hackathon** — by [@0xwillgax](https://twitter.com/0xwillgax)

---

## Links

- 🌐 [Live App](https://shelbyvault2.vercel.app)
- 🔐 [Shelby Explorer](https://explorer.shelby.xyz/testnet)
- ⛓ [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet)
- 📖 [Shelby Docs](https://docs.shelby.xyz)
- 🐦 [Twitter / X](https://twitter.com/0xwillgax)
