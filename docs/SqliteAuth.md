# 🗄️ SQLite Single File Auth (Bun Only)

Library ini mendukung penyimpanan *authentication state* ke dalam satu file database SQLite menggunakan fitur `bun:sqlite` yang sangat cepat.

## 🌟 Keuntungan
* **Hanya 1 File:** Tidak ada lagi ribuan file JSON di folder `auth_session`.
* **Performa Tinggi:** Database SQLite jauh lebih cepat untuk operasi baca/tulis massal.
* **Aman:** Lebih tahan terhadap kerusakan data (*file corruption*) dibandingkan file JSON biasa.

## 🚀 Cara Penggunaan

Gunakan `useSqliteAuthState` alih-alih `useMultiFileAuthState`.

```javascript
import makeWASocket, { useSqliteAuthState } from 'DzBailey'

async function startBot() {
    // Simpan semua data sesi ke file 'session.db'
    const { state, saveCreds } = await useSqliteAuthState('session.db')
    
    const sock = makeWASocket({
        auth: state,
        // ... konfigurasi lainnya
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()
```

## 🛠️ Persyaratan
Fitur ini memerlukan **Bun** sebagai runtime. Jika Anda menggunakan Node.js, gunakan `useMultiFileAuthState` standar.
