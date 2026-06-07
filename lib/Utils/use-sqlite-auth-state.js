import { Database } from 'bun:sqlite';
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';

/**
 * Single File Auth State menggunakan bun:sqlite
 * Sangat efisien karena semua data disimpan dalam satu file .db
 */
export const useSqliteAuthState = async (filename) => {
    const db = new Database(filename);

    // Buat tabel jika belum ada
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            data TEXT,
            timestamp INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Tambahkan kolom timestamp ke tabel lama jika belum ada (backward compatibility)
    try {
        db.run("ALTER TABLE sessions ADD COLUMN timestamp INTEGER DEFAULT (strftime('%s', 'now'))");
    } catch (e) {
        // Kolom sudah ada, abaikan
    }

    const writeData = (data, id) => {
        const json = JSON.stringify(data, BufferJSON.replacer);
        db.prepare('INSERT OR REPLACE INTO sessions (id, data, timestamp) VALUES (?, ?, strftime(\'%s\', \'now\'))').run(id, json);
    };

    const readData = (id) => {
        try {
            const row = db.prepare('SELECT data FROM sessions WHERE id = ?').get(id);
            if (!row) return null;
            return JSON.parse(row.data, BufferJSON.reviver);
        } catch (error) {
            return null;
        }
    };

    const removeData = (id) => {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    };

    // Auto-clean: Hapus pre-keys yang berumur lebih dari 14 hari
    try {
        const result = db.prepare('DELETE FROM sessions WHERE id LIKE \'pre-key-%\' AND timestamp < (strftime(\'%s\', \'now\') - 14 * 24 * 60 * 60)').run();
        if (result.changes > 0) {
            console.log(`[DzBailey] Auto-clean: Berhasil menghapus ${result.changes} pre-keys lama dari database.`);
        }
    } catch (error) {
        // Abaikan error
    }

    const creds = (await readData('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }
                    return data;
                },
                set: async (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const keyId = `${category}-${id}`;
                            if (value) {
                                writeData(value, keyId);
                            } else {
                                removeData(keyId);
                            }
                        }
                    }
                }
            }
        },
        saveCreds: async () => {
            writeData(creds, 'creds');
        },
        clearState: async () => {
            db.run('DELETE FROM sessions');
        }
    };
};
