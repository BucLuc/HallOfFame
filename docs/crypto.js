'use strict';
// Versioned envelope; only ciphertext and public cryptographic parameters leave the browser.
window.ArchiveCrypto = (() => {
  const iterations = 600000;
  const context = new TextEncoder().encode('HallOfFame/archive/v1');
  function available() {
    if (!globalThis.crypto?.subtle) throw new Error('Web Crypto ist nicht verfügbar. Bitte einen aktuellen Browser und HTTPS oder eine lokale HTML-Datei verwenden.');
  }
  function validate(data) {
    if (!data || !Array.isArray(data.stories) || !data.stories.every(s => s && ['title', 'author', 'writtenAt', 'story'].every(k => typeof s[k] === 'string'))) throw new Error('Ungültige Story-JSON: stories muss Einträge mit title, author, writtenAt und story enthalten.');
    return data;
  }
  function encode(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(result);
  }
  function decode(value) {
    if (typeof value !== 'string') throw new Error('Ungültige verschlüsselte Datei.');
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
  }
  async function key(password, salt, usage) {
    const bytes = new TextEncoder().encode(password);
    try {
      const material = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveKey']);
      return await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, { name: 'AES-GCM', length: 256 }, false, [usage]);
    } finally { bytes.fill(0); }
  }
  async function encrypt(data, password) {
    available(); validate(data);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    try {
      const secret = await key(password, salt, 'encrypt');
      const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: context, tagLength: 128 }, secret, plaintext);
      return { version: 1, algorithm: 'AES-256-GCM', kdf: 'PBKDF2-SHA-256', iterations, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
    } finally { plaintext.fill(0); }
  }
  async function decrypt(envelope, password) {
    available();
    if (!envelope || envelope.version !== 1 || envelope.algorithm !== 'AES-256-GCM' || envelope.kdf !== 'PBKDF2-SHA-256' || envelope.iterations !== iterations) throw new Error('Unbekanntes Verschlüsselungsformat.');
    const salt = decode(envelope.salt), iv = decode(envelope.iv), ciphertext = decode(envelope.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16) throw new Error('Ungültige verschlüsselte Datei.');
    const secret = await key(password, salt, 'decrypt');
    const plaintext = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: context, tagLength: 128 }, secret, ciphertext));
    try { return validate(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plaintext))); }
    finally { plaintext.fill(0); }
  }
  return Object.freeze({ encrypt, decrypt, validate });
})();

