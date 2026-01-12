const crypto = require('crypto');

function getKey() {
  const env = process.env.ENCRYPTION_KEY;
  if (env) {
    // accept base64 or hex; otherwise treat as utf-8 passphrase hashed to 32 bytes
    try {
      if (/^[A-Fa-f0-9]{64}$/.test(env)) return Buffer.from(env, 'hex');
      const b64 = Buffer.from(env, 'base64');
      if (b64.length === 32) return b64;
    } catch (_) {}
    return crypto.createHash('sha256').update(env).digest();
  }
  // Development fallback. Replace in production via ENV.
  return crypto.createHash('sha256').update('dev-encryption-key-change-me').digest();
}

function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    body: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

function decrypt(body, ivB64, tagB64) {
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(body, 'base64')),
    decipher.final()
  ]);
  return plaintext.toString('utf8');
}

module.exports = { encrypt, decrypt };
