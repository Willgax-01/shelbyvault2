# 🧠 ShelbyVault 2.0 — AI Memory Storage

> Permanent decentralized memory layer for autonomous AI agents, built on [Shelby Protocol](https://shelby.xyz) × Aptos blockchain.

![ShelbyVault 2.0](https://img.shields.io/badge/ShelbyVault-2.0-00FF88?style=for-the-badge&labelColor=03050A)
![Shelby Protocol](https://img.shields.io/badge/Shelby-Testnet-0EA5E9?style=for-the-badge&labelColor=03050A)
![Aptos](https://img.shields.io/badge/Aptos-Blockchain-A855F7?style=for-the-badge&labelColor=03050A)

---

## What is ShelbyVault 2.0?

ShelbyVault 2.0 is an **AI memory vault** — a permanent, decentralized storage layer for AI agents. Think of it as a hard drive for AI brains.

Instead of AI agent outputs disappearing after a session, ShelbyVault stores them **on-chain forever** via Shelby Protocol's decentralized blob storage on Aptos.

### What can agents store?

| Type | Description |
|------|-------------|
| 🧠 **Reasoning** | Chain-of-thought, internal agent reasoning |
| 🎨 **Image** | AI-generated visuals (Seedream 3.0) |
| 📋 **Log** | Agent execution logs, events |
| ⚡ **Decision** | Autonomous agent decisions with context |
| 🔬 **Research** | Research outputs, summaries, findings |
| 💾 **Checkpoint** | Model state, training snapshots |

---

## Features

- **Store anything** — text, JSON, images, logs, decisions
- **On-chain proof** — every memory gets a transaction hash on Aptos
- **AI image gen** — generate images with Seedream 3.0 and store them instantly
- **Memory Vault** — browse, filter, search all stored memories
- **Agent API** — any AI agent can POST memories via HTTP
- **Shelby Explorer** — verify every stored blob on-chain

---

## Agent API

Any AI agent can store memories with a simple HTTP call:

```js
// JavaScript / Node.js
const response = await fetch('https://shelbyvault2.vercel.app/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name:    'agent-reasoning-001',
    type:    'reasoning',   // reasoning | image | log | decision | research | checkpoint
    content: 'The agent concluded that...',
    agentId: 'gpt-4-turbo',
    tags:    ['production', 'chain-of-thought']
  })
})
const { blobName, txHash, explorerUrl } = await response.json()
```

```python
# Python — works with LangChain, AutoGen, CrewAI...
import requests

requests.post('https://shelbyvault2.vercel.app/api/upload', json={
    'name':    f'decision-{agent_id}-{timestamp}',
    'type':    'decision',
    'content': agent.last_decision,
    'agentId': agent_id,
    'tags':    ['autonomous', 'production']
})
```

### Response
```json
{
  "success":     true,
  "blobName":    "agent-reasoning-001",
  "size":        "2.4 KB",
  "txHash":      "0x4b858271b019cc711e6906e34104ee0ca8db...",
  "explorerUrl": "https://explorer.shelby.xyz/testnet/blobs/...",
  "aptosUrl":    "https://explorer.aptoslabs.com/txn/..."
}
```

---

## Tech Stack

- **Storage** — [Shelby Protocol](https://shelby.xyz) decentralized blob storage
- **Blockchain** — Aptos Testnet
- **Image AI** — Seedream 3.0 via Puter.js (ByteDance/Together AI)
- **Backend** — Vercel Serverless Functions
- **Frontend** — Vanilla HTML/CSS/JS (zero dependencies)
- **SDK** — `@shelby-protocol/sdk` + `@aptos-labs/ts-sdk`

---

## Project Structure

```
shelbyvault2/
├── public/
│   └── index.html      ← Full dashboard UI
├── api/
│   └── upload.js       ← Memory storage serverless function
├── package.json
├── vercel.json
└── .npmrc
```

---

## Deploy Your Own

### 1. Clone & push to GitHub
```bash
git clone https://github.com/YOUR_USERNAME/shelbyvault2
```

### 2. Deploy to Vercel
Import the repo on [vercel.com/new](https://vercel.com/new) and add these environment variables:

| Variable | Value |
|----------|-------|
| `SHELBY_PRIVATE_KEY` | `ed25519-priv-0x...` your Aptos wallet private key |
| `SHELBY_API_KEY` | `aptoslabs_...` your Shelby/Geomi API key |

### 3. Get Shelby testnet access
- Sign up at [geomi.xyz](https://geomi.xyz) for a Shelby API key
- Fund your Aptos testnet wallet with SHELBY tokens

---

## Built by

[@0xwillgax](https://twitter.com/0xwillgax) for the Shelby Protocol Hackathon

---

## Links

- 🌐 [Live App](https://shelbyvault2.vercel.app)
- 🔐 [Shelby Explorer](https://explorer.shelby.xyz/testnet)
- ⛓ [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet)
- 📖 [Shelby Docs](https://docs.shelby.xyz)
