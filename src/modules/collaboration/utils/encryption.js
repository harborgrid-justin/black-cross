/**
 * Encryption utility for secure messaging
 */

const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

/**
 * Encrypt text
 * @param {string} text - Text to encrypt
 * @param {string} password - Encryption password
 * @returns {string} Encrypted text with salt, iv, and tag
 */
function encrypt(text, password) {
  const salt = crypto.randomBytes(saltLength);
  const key = crypto.pbkdf2Sync(password, salt, 100000, keyLength, 'sha256');
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
}

/**
 * Decrypt text
 * @param {string} encryptedData - Encrypted data
 * @param {string} password - Decryption password
 * @returns {string} Decrypted text
 */
function decrypt(encryptedData, password) {
  const buffer = Buffer.from(encryptedData, 'base64');

  const salt = buffer.slice(0, saltLength);
  const iv = buffer.slice(saltLength, saltLength + ivLength);
  const tag = buffer.slice(saltLength + ivLength, saltLength + ivLength + tagLength);
  const encrypted = buffer.slice(saltLength + ivLength + tagLength);

  const key = crypto.pbkdf2Sync(password, salt, 100000, keyLength, 'sha256');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate encryption key
 * @returns {string} Generated key
 */
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateKey,
};
