'use strict';
document.querySelector('#encrypt-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const status = document.querySelector('#status');
  let password = document.querySelector('#secret').value;
  let confirmation = document.querySelector('#confirm').value;
  if (password !== confirmation) { status.textContent = 'Die Passphrasen stimmen nicht überein.'; return; }
  const file = document.querySelector('#source').files[0];
  form.reset();
  document.querySelector('#fallback').hidden = true;
  document.querySelector('#encrypted-output').value = '';
  const button = form.querySelector('button');
  button.disabled = true; status.textContent = 'Das Archiv wird lokal verschlüsselt…';
  try {
    const envelope = await ArchiveCrypto.encrypt(JSON.parse(await file.text()), password);
    const content = JSON.stringify(envelope, null, 2);
    document.querySelector('#encrypted-output').value = content;
    document.querySelector('#fallback').hidden = false;
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'encrypted-data.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'Fertig. Ersetze docs/encrypted-data.json durch den Download. Deine Passphrase wird für jeden Zugriff benötigt.';
  } catch (error) { status.textContent = error instanceof SyntaxError ? 'Die ausgewählte Datei ist keine gültige JSON-Datei.' : error.message; }
  finally { password = ''; confirmation = ''; button.disabled = false; }
});


