# 📌 Tutorial Interactive Messaging (Native Flow)

Repositori ini telah di-patch untuk mendukung pesan interaktif modern WhatsApp (Native Flow) yang stabil di Android dan iOS versi terbaru. Panduan ini menjelaskan cara menggunakannya.

## 🚀 Persyaratan Utama
1. Gunakan `generateWAMessageFromContent` untuk menyusun pesan.
2. Gunakan `relayMessage` untuk mengirim pesan.
3. Selalu bungkus di dalam `viewOnceMessageV2` agar muncul di WhatsApp terbaru.

---

## 1. Quick Reply (Tombol Biasa)
Digunakan untuk interaksi cepat yang mengirimkan teks/ID kembali ke bot.

```javascript
import { proto, generateWAMessageFromContent } from 'DzBailey'

const interactiveMessage = {
  body: { text: "Pilih salah satu tombol di bawah:" },
  footer: { text: "Powered by DzBailey Patch" },
  header: { title: "Hello World", hasMediaAttachment: false },
  nativeFlowMessage: {
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Ping Bot",
          id: ".ping"
        })
      }
    ],
    messageParamsJson: JSON.stringify({ messageVersion: 1 })
  }
};

const msg = generateWAMessageFromContent(jid, {
  viewOnceMessageV2: {
    message: {
      messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
      interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
    }
  }
}, { userJid: sock.user.id, quoted: m });

await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
```

---

## 2. Single Select (List Menu)
Dropdown menu yang sangat rapi untuk menampilkan banyak opsi.

```javascript
const interactiveMessage = {
  body: { text: "Silakan pilih layanan kami:" },
  footer: { text: "Menu Utama" },
  nativeFlowMessage: {
    buttons: [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "Klik untuk memilih",
          sections: [
            {
              title: "KATEGORI 1",
              rows: [
                { title: "Menu A", description: "Deskripsi A", id: ".menu-a" },
                { title: "Menu B", description: "Deskripsi B", id: ".menu-b" }
              ]
            }
          ]
        })
      }
    ],
    messageParamsJson: JSON.stringify({ messageVersion: 1 })
  }
};
```

---

## 3. CTA URL (Tombol Link)
Tombol untuk mengarahkan pengguna ke situs web eksternal.

```javascript
const interactiveMessage = {
  body: { text: "Kunjungi repositori kami untuk update terbaru." },
  nativeFlowMessage: {
    buttons: [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Buka GitHub",
          url: "https://github.com/Dz/dz-baileys",
          merchant_url: "https://github.com/Dz/dz-baileys"
        })
      }
    ],
    messageParamsJson: JSON.stringify({ messageVersion: 1 })
  }
};
```

---

## 4. Advanced List
Untuk membuat list yang lebih kompleks dengan dukungan banyak tombol select dan kustomisasi *Bottom Sheet*, silakan baca:
**[Panduan Advanced List](./AdvancedList.md)**

## 📝 Tips Tambahan
* **ID Tombol:** Anda bisa menyertakan prefix (seperti `.ping`) agar saat diklik, bot langsung memprosesnya sebagai perintah teks.
* **Header:** Anda bisa menambahkan `imageMessage` atau `videoMessage` di dalam properti `header` untuk membuat tampilan lebih menarik.

---

## 📥 Handling Response (Parsing)
Saat pengguna mengklik tombol *Quick Reply* atau memilih opsi dari *Single Select*, WhatsApp akan mengirimkan tipe pesan `interactiveResponseMessage`. Gunakan fungsi berikut untuk mengekstrak ID-nya agar bisa diproses sebagai perintah:

```javascript
export function getMessageText(m) {
  const msg = m.message;
  
  // Ambil konten asli jika pesan dibungkus viewOnce
  const content = msg?.viewOnceMessageV2?.message || 
                  msg?.viewOnceMessage?.message || 
                  msg;

  // 1. Cek teks biasa
  if (content?.conversation) return content.conversation;
  if (content?.extendedTextMessage?.text) return content.extendedTextMessage.text;

  // 2. Cek respons tombol (Native Flow)
  if (content?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    try {
      const params = JSON.parse(content.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
      return params.id || ""; // Mengembalikan ID tombol (misal: .ping)
    } catch {
      return "";
    }
  }

  // 3. Cek respons tombol gaya lama (Legacy)
  if (content?.buttonsResponseMessage?.selectedButtonId) return content.buttonsResponseMessage.selectedButtonId;
  if (content?.templateButtonReplyMessage?.selectedId) return content.templateButtonReplyMessage.selectedId;

  return "";
}
```
