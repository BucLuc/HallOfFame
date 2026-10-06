# Hall of Fame — verschlüsseltes statisches Archiv

Kein Backend, Node, Paketmanager oder Build-Schritt erforderlich. Alle Kryptografie läuft im Browser mit der eingebauten Web-Crypto-API. Die öffentliche Website benötigt HTTPS, wie bei GitHub Pages üblich.

## Einmal einrichten / Daten aktualisieren

1. Doppelklicke `tools/encrypt.html` (Chrome, Edge oder Firefox).
2. Wähle deine private `data/data.json` oder eine JSON-Datei außerhalb des Projekts.
3. Gib eine lange, einzigartige Passphrase zweimal ein. Es gibt keine Mindestlänge; empfohlen sind 6 zufällig gewählte Wörter oder ein zufälliges Passwort aus einem Passwortmanager. Leerzeichen, Umlaute und Emoji sind erlaubt und werden exakt übernommen.
4. Klicke „Verschlüsseln & herunterladen“. Speichere den Download als `docs/encrypted-data.json` und ersetze die bisherige Datei. Falls dein Browser einen Namen wie `encrypted-data (1).json` verwendet, benenne ihn um.
5. Öffne die Website über HTTPS (z. B. GitHub Pages). Sie lädt immer `encrypted-data.json` neben der HTML-Datei automatisch. Gib dieselbe Passphrase ein. Die Dateiauswahl im Login entfällt vollständig. Direktes Öffnen per file:// funktioniert nicht mehr, da Browser das automatische Laden lokaler JSON-Dateien blockieren.

Wiederhole diese Schritte bei jeder Änderung an der privaten JSON. Eine neue Verschlüsselung erhält automatisch frischen Salt und IV, auch bei derselben Passphrase. Das lokale Werkzeug arbeitet ohne Netzwerkzugriff. Die enthaltene `docs/encrypted-data.json` ist zunächst nur `null`: Es wurde bewusst kein Passwort vorgegeben. Du erzeugst das echte Archiv selbst.

## GitHub Pages

- Committe ausschließlich öffentliche Dateien: `docs/`, optional das Werkzeug und diese Anleitung. `.gitignore` schließt `data/`, `private/`, `*.local.json`, Backups und ZIP-Dateien aus. Private Dateien an anderen Orten werden nicht automatisch geschützt; halte sie am besten außerhalb des Repositories.
- Aktiviere unter Repository → Settings → Pages „Deploy from a branch“, wähle deinen Branch und `/docs` als Ordner.
- Veröffentlicht werden HTML, CSS, JavaScript und `encrypted-data.json`. In diesem Datenblock stehen nur Salt, IV, Formatparameter und authentifizierter Ciphertext. Es werden keine Story-Titel, Autoren, Texte, Passwort-Hashes oder Passwörter veröffentlicht.
- Kontrolliere vor dem Push die vorgemerkten Dateien. `.gitignore` entfernt keine bereits getrackten Dateien oder frühere Git-Commits. Falls Klartextdaten schon öffentlich waren, genügt das Löschen im aktuellen Stand nicht; verwende ein neues sauberes Repository und behandle die alten Inhalte als bereits offengelegt.

## Verschlüsselung

AES-256-GCM mit 128-Bit-Authentifizierungstag schützt Vertraulichkeit und erkennt Manipulationen. Der Schlüssel wird aus der Passphrase mit PBKDF2-HMAC-SHA-256 und 600.000 Iterationen abgeleitet. Jede Verschlüsselung verwendet einen kryptografisch zufälligen 16-Byte-Salt und einen frischen 12-Byte-IV. Die Formatversion ist zusätzlich authentifiziert. Die App akzeptiert nur das festgelegte Format und eine korrekt authentifizierte Story-Datei. UTF-8 über TextEncoder/TextDecoder erhält Sonderzeichen und Umlaute.

Ein falsches Passwort oder manipulierte Daten ergeben keine sichtbaren Stories. Verschlüsselt wird die gesamte Story-Struktur; die Größe der verschlüsselten Datei bleibt öffentlich erkennbar. Jeder kann den Ciphertext herunterladen und offline Passphrasen ausprobieren. Deshalb ist eine lange, zufällige Passphrase entscheidend; eine Wartezeit im Login würde Offline-Angriffe nicht verhindern.

Referenz: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey und https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt

## Browser-Verhalten und Grenzen

Die App schreibt weder Passphrase, Schlüssel noch entschlüsselte Stories in localStorage, sessionStorage, IndexedDB, Cookies oder einen Service Worker. Passwortfelder werden nach dem Absenden geleert, Schlüssel sind nicht exportierbar. Entschlüsselte Daten werden nur während der geöffneten Sitzung im Arbeitsspeicher dargestellt. „Sperren“, Neuladen und das Verlassen der Seite entfernen die App-Daten und verlangen erneutes Entsperren. Rückkehr über den Browser-Verlauf entsperrt nicht automatisch.

JavaScript kann eine vollständige physische Löschung sämtlicher Speicherkopien nicht garantieren. Passwortmanager, Browser-Erweiterungen, Screenshots und bewusstes Kopieren liegen außerhalb der App. Die Funktion „Copy masterpiece“ kopiert nur auf ausdrücklichen Klick in die Zwischenablage; dort kann Text länger bestehen. Ein entschlüsselnder Nutzer kann die Daten selbstverständlich selbst kopieren. Passwörter müssen nicht an die Website oder einen Server übertragen werden.

Die Website verwendet keine externen Skripte. Die ursprünglichen Google Fonts werden für das ursprüngliche Design geladen; Passwort und Story-Daten werden dabei nicht übertragen. Offline greifen lokale Ersatzschriften. Eine Content Security Policy beschränkt Skripte auf lokale Dateien. Vertrauen in den veröffentlichten Website-Code ist trotzdem erforderlich: Wer diesen Code verändern kann, könnte Passwort oder Klartext beim nächsten Entsperren abgreifen.

Bei Verlust der Passphrase lässt sich ein vorhandenes Archiv nicht wiederherstellen. Du kannst mit deiner privaten Original-JSON eine neue verschlüsselte Version erzeugen. Ein Passwortwechsel verhindert keine Entschlüsselung bereits heruntergeladener älterer Archive mit der alten Passphrase.


