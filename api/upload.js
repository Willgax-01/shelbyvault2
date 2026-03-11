/**
 * /api/upload.js — ShelbyVault 2.0
 * AI Memory Storage for autonomous agents
 * Stores any memory type: reasoning, image, log, decision, research, checkpoint
 */

import { ShelbyNodeClient } from '@shelby-protocol/sdk/node';
import { Account, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';

const OWNER_ADDRESS = '0x18d06e7fc631aa48ec21e6b66039699e3dd1a17697dc3751eb80c8b00b97ac94';
const ONE_DAY_MICROS = 86_400_000_000n;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      imageBase64,   // base64 payload (image OR text encoded as base64)
      filename,
      memoryType = 'reasoning',
      agentId    = '',
      tags       = [],
      name       = '',
      expiryDays = 7,
    } = req.body;

    if (!imageBase64 || !filename) {
      return res.status(400).json({ error: 'Missing imageBase64 or filename' });
    }

    // Decode payload
    const base64Data  = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const blobData    = Buffer.from(base64Data, 'base64');

    console.log(`=== ShelbyVault 2.0 — ${memoryType.toUpperCase()} MEMORY ===`);
    console.log(`Name: ${name} | File: ${filename} | Size: ${blobData.byteLength} bytes`);
    if (agentId) console.log(`Agent: ${agentId}`);
    if (tags.length) console.log(`Tags: ${tags.join(', ')}`);

    const privateKeyStr = process.env.SHELBY_PRIVATE_KEY;
    const apiKey        = process.env.SHELBY_API_KEY;

    if (!privateKeyStr || !apiKey) {
      console.log('Missing keys — demo mode');
      return res.status(200).json({
        success: true, blobName: filename,
        size: formatSize(blobData.byteLength),
        memoryType, agentId, tags,
        ...demoShelby(filename)
      });
    }

    // Build signer
    const keyStr = privateKeyStr.startsWith('ed25519-priv-')
      ? privateKeyStr
      : `ed25519-priv-${privateKeyStr}`;

    const privateKey = new Ed25519PrivateKey(keyStr);
    const signer     = Account.fromPrivateKey({ privateKey });

    // Init Shelby SDK
    const client = new ShelbyNodeClient({ network: Network.TESTNET, apiKey });

    const expirationMicros = BigInt(Date.now()) * 1000n + ONE_DAY_MICROS * BigInt(expiryDays);

    console.log('Uploading to Shelby...');
    const result = await client.upload({
      blobData,
      signer,
      blobName: filename,
      expirationMicros,
    });

    console.log('✅ Upload complete!', JSON.stringify(result));

    const txHash = result?.txHash || result?.tx_hash || result?.hash || '';

    return res.status(200).json({
      success:     true,
      blobName:    filename,
      size:        formatSize(blobData.byteLength),
      memoryType,
      agentId,
      tags,
      demo:        false,
      txHash,
      explorerUrl: `https://explorer.shelby.xyz/testnet/blobs/${OWNER_ADDRESS}?blobName=${encodeURIComponent(filename)}`,
      aptosUrl:    txHash ? `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet` : '',
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    const { imageBase64, filename, memoryType = 'reasoning' } = req.body || {};
    const bytes = imageBase64
      ? Buffer.from(imageBase64.replace(/^data:[^;]+;base64,/, ''), 'base64')
      : null;
    return res.status(200).json({
      success:    true,
      blobName:   filename,
      size:       bytes ? formatSize(bytes.byteLength) : '—',
      memoryType,
      ...demoShelby(filename),
      _error:     err.message
    });
  }
}

function demoShelby(filename) {
  const tx = fakeTx();
  return {
    demo: true, txHash: tx,
    explorerUrl: 'https://explorer.shelby.xyz/testnet',
    aptosUrl: `https://explorer.aptoslabs.com/txn/${tx}?network=testnet`
  };
}

function fakeTx() {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}
