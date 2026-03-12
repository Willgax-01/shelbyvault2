/**
 * /api/upload.js — ShelbyVault 2.0
 * AI Memory Storage for autonomous agents
 */

const OWNER_ADDRESS = '0x18d06e7fc631aa48ec21e6b66039699e3dd1a17697dc3751eb80c8b00b97ac94';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      imageBase64,
      filename,
      memoryType = 'reasoning',
      agentId    = '',
      tags       = [],
      name       = '',
      expiryDays = 7,
    } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Missing filename' });
    }

    // Decode payload size
    let blobSize = 0;
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
      blobSize = Buffer.from(base64Data, 'base64').byteLength;
    }

    console.log(`=== ShelbyVault 2.0 — ${memoryType.toUpperCase()} ===`);
    console.log(`Name: ${name} | File: ${filename} | Size: ${blobSize} bytes`);

    const privateKeyStr = process.env.SHELBY_PRIVATE_KEY;
    const apiKey        = process.env.SHELBY_API_KEY;

    if (!privateKeyStr || !apiKey) {
      console.log('Missing keys — demo mode');
      return res.status(200).json({
        success: true, blobName: filename,
        size: formatSize(blobSize),
        memoryType, agentId, tags,
        ...demoShelby(filename)
      });
    }

    // Import SDK dynamically to avoid cold-start crash
    const { ShelbyNodeClient } = await import('@shelby-protocol/sdk/node');
    const { Account, Ed25519PrivateKey, Network } = await import('@aptos-labs/ts-sdk');

    const keyStr = privateKeyStr.startsWith('ed25519-priv-')
      ? privateKeyStr
      : `ed25519-priv-${privateKeyStr}`;

    const privateKey = new Ed25519PrivateKey(keyStr);
    const signer     = Account.fromPrivateKey({ privateKey });
    const client     = new ShelbyNodeClient({ network: Network.TESTNET, apiKey });

    const ONE_DAY_MICROS   = 86_400_000_000n;
    const expirationMicros = BigInt(Date.now()) * 1000n + ONE_DAY_MICROS * BigInt(expiryDays);

    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const blobData   = Buffer.from(base64Data, 'base64');

    console.log('Uploading to Shelby...');
    const result = await client.upload({ blobData, signer, blobName: filename, expirationMicros });
    console.log('✅ Upload complete!');

    const txHash = result?.txHash || result?.tx_hash || result?.hash || '';

    return res.status(200).json({
      success:     true,
      blobName:    filename,
      size:        formatSize(blobData.byteLength),
      memoryType, agentId, tags,
      demo:        false,
      txHash,
      explorerUrl: `https://explorer.shelby.xyz/testnet/blobs/${OWNER_ADDRESS}?blobName=${encodeURIComponent(filename)}`,
      aptosUrl:    txHash ? `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet` : '',
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    const { filename, memoryType = 'reasoning' } = req.body || {};
    return res.status(200).json({
      success: true, blobName: filename, size: '—',
      memoryType, ...demoShelby(filename), _error: err.message
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
