# 🚀 Quick Start Guide

Panduan cepat untuk memulai menggunakan library DzBailey yang sudah di-patch ini.

## 1. Instalasi
Karena library ini berada di repositori personal Anda, instal menggunakan Bun:

```bash
bun add github:Dz/dz-baileys
```

## 2. Koneksi Pertama (Pairing Code)
Gunakan kode berikut untuk menghubungkan bot tanpa scan QR:

```javascript
import makeWASocket, { useMultiFileAuthState } from 'DzBailey'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Matikan QR karena pakai pairing
    })

    // Minta Pairing Code (Custom 8 Karakter)
    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode("628123456789", "BOTWA001")
        console.log(`Masukkan kode ini di WhatsApp: ${code}`)
    }

    sock.ev.on('creds.update', saveCreds)
}

startBot()
```

## 3. Mengirim Pesan Interaktif Pertama
Setelah bot terhubung, coba kirim tombol interaktif:

```javascript
const interactiveMessage = {
  body: { text: "Halo! Ini tombol Native Flow." },
  nativeFlowMessage: {
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: "Ping", id: ".ping" })
      }
    ],
    messageParamsJson: JSON.stringify({ messageVersion: 1 })
  }
}

const msg = generateWAMessageFromContent(jid, {
  viewOnceMessageV2: {
    message: {
      interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
    }
  }
}, { userJid: sock.user.id })

await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
```

## 4. Struktur Penting
* **`docs/Interactive.md`**: Detail tentang pengiriman berbagai tipe tombol.
* **`docs/CustomPairing.md`**: Detail tentang aturan custom pairing code.

---
© 2026 Dz - Advanced DzBailey Library
