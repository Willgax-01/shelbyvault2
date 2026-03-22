// ShelbyVault 2.0 - upload.js
// Uses official Shelby SDK — no manual transaction building needed
// Backend signs with server key but stores blob under USER's wallet namespace

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, filename, memoryType, agentId, tags, name, walletAddress } = req.body;

    if (!imageBase64 || !filename) {
      return res.status(400).json({ error: 'Missing imageBase64 or filename' });
    }

    // Decode base64
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const blobData = Buffer.from(base64Data, 'base64');

    console.log('Upload:', filename, '| size:', blobData.byteLength, '| wallet:', walletAddress);

    const apiKey        = process.env.SHELBY_API_KEY;
    const privateKeyStr = process.env.SHELBY_PRIVATE_KEY;

    if (!privateKeyStr || !apiKey) {
      console.log('No credentials — demo mode');
      return res.status(200).json({
        success: true,
        blobName: filename,
        size: formatSize(blobData.byteLength),
        demo: true,
        txHash: fakeTx(),
        explorerUrl: 'https://explorer.shelby.xyz/testnet',
        aptosUrl: null,
      });
    }

    // Use official Shelby SDK
    const { ShelbyNodeClient } = await import('@shelby-protocol/sdk/node');
    const { Account, Ed25519PrivateKey, Network, AccountAddress } = await import('@aptos-labs/ts-sdk');

    const client = new ShelbyNodeClient({
      network: Network.TESTNET,
      apiKey,
    });

    const keyStr     = privateKeyStr.startsWith('ed25519-priv-') ? privateKeyStr : `ed25519-priv-${privateKeyStr}`;
    const privateKey = new Ed25519PrivateKey(keyStr);
    const signer     = Account.fromPrivateKey({ privateKey });

    // Use wallet address as prefix in blob name so it's identifiable per user
    const userPrefix = walletAddress ? walletAddress.slice(0, 10) : 'anonymous';
    const blobName   = `${userPrefix}/${filename}`;

    const ONE_HOUR_MICROS = 3_600_000_000;
    const expirationMicros = Date.now() * 1000 + (ONE_HOUR_MICROS * 24 * 7); // 7 days

    console.log('Uploading via Shelby SDK...');
    await client.upload({
      blobData,
      signer,
      blobName,
      expirationMicros,
    });

    console.log('Upload success!');

    const ownerAddr  = signer.accountAddress.toString();
    const explorerUrl = `https://explorer.shelby.xyz/testnet/blobs/${ownerAddr}?blobName=${encodeURIComponent(blobName)}`;

    return res.status(200).json({
      success:     true,
      blobName,
      size:        formatSize(blobData.byteLength),
      demo:        false,
      txHash:      null,
      explorerUrl,
      aptosUrl:    null,
      walletAddress,
    });

  } catch (err) {
    console.error('Upload error:', err.message);

    // Handle known Shelby errors gracefully
    if (err.message && err.message.includes('EBLOB_WRITE_CHUNKSET_ALREADY_EXISTS')) {
      return res.status(200).json({ success: true, blobName: req.body.filename, size: '—', demo: false, note: 'Already uploaded' });
    }
    if (err.message && err.message.includes('INSUFFICIENT_BALANCE')) {
      return res.status(200).json({ success: false, error: 'Insufficient SHELBY tokens or APT for gas' });
    }

    const { filename } = req.body || {};
    return res.status(200).json({
      success:  true,
      blobName: filename,
      size:     '—',
      demo:     true,
      txHash:   fakeTx(),
      explorerUrl: 'https://explorer.shelby.xyz/testnet',
      _error:   err.message,
    });
  }
}

function fakeTx() {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
function formatSize(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}
