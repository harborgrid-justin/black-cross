/**
 * Encryption utilities for secure messaging
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Generate encryption key
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Encrypt text
 * @param {string} text - Text to encrypt
 * @param {Buffer} key - Encryption key
 * @returns {Object} Encrypted data with iv and auth tag
 */
function encrypt(text, key) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt text
 * @param {string} encrypted - Encrypted text
 * @param {Buffer} key - Encryption key
 * @param {string} iv - Initialization vector
 * @param {string} authTag - Authentication tag
 * @returns {string} Decrypted text
 */
function decrypt(encrypted, key, iv, authTag) {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Hash text using SHA-256
 * @param {string} text - Text to hash
 * @returns {string} Hash
 */
function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = {
  generateKey,
  encrypt,
  decrypt,
  hash,
};
