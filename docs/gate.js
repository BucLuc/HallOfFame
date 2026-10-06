'use strict';
let unlockGeneration = 0;
let encryptedEnvelope = null;
function lockArchive() {
  unlockGeneration++;
  document.dispatchEvent(new Event('archive-locked'));
  document.title = 'The Hall of Fame — Locked';
  document.querySelector('#private-navigation').hidden = true;
  const app = document.querySelector('#app');
  app.innerHTML = `<section class="vault"><div class="eyebrow">THE IMMORTAL ARCHIVE</div><div class="crest" aria-hidden="true">✦</div><h1>Greatness awaits.<br><em>Enter the vault.</em></h1><p>Dieses Archiv ist verschlüsselt.<br>Öffne die Tore mit deiner Passphrase.</p><form id="unlock-form" autocomplete="off"><label for="password">Passphrase</label><input id="password" type="password" autocomplete="off" required spellcheck="false"><button class="gold-button" type="submit">Archiv öffnen <span>↗</span></button><p id="unlock-status" role="status" aria-live="polite"></p></form></section>`;
  document.querySelector('#unlock-form').addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.querySelector('#password');
    let password = input.value;
    input.value = '';
    const status = document.querySelector('#unlock-status');
    const button = event.target.querySelector('button');
    const generation = unlockGeneration;
    let loading = true;
    button.disabled = true; status.textContent = 'Das Archiv wird entschlüsselt…';
    try {
      {
        const response = await fetch('encrypted-data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('missing');
        encryptedEnvelope = await response.json();
      }
      if (!encryptedEnvelope) throw new Error('missing');
      loading = false;
      const data = await ArchiveCrypto.decrypt(encryptedEnvelope, password);
      if (generation !== unlockGeneration) return;
      document.dispatchEvent(new CustomEvent('archive-unlocked', { detail: data }));
      document.querySelector('#private-navigation').hidden = false;
    } catch (error) {
      if (generation !== unlockGeneration) return;
      status.textContent = loading ? (location.protocol === 'file:' ? 'Automatisches Laden ist bei lokalen HTML-Dateien nicht verfügbar. Öffne die Website über HTTPS, z. B. auf GitHub Pages.' : 'Verschlüsseltes Archiv fehlt oder ist ungültig. Erstelle es lokal mit tools/encrypt.html.') : !globalThis.crypto?.subtle ? error.message : 'Falsche Passphrase oder beschädigtes Archiv.';
      button.disabled = false; input.focus();
    } finally { password = ''; }
  });
}
document.querySelector('#lock').addEventListener('click', lockArchive);
window.addEventListener('pagehide', lockArchive);
window.addEventListener('pageshow', event => { if (event.persisted) lockArchive(); });
lockArchive();

