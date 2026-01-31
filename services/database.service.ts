import * as SQLite from 'expo-sqlite';
import { PRAYER_TYPE_MAP, PrayerData, PrayerType } from '../types/prayer.types';

let db: SQLite.SQLiteDatabase | null = null;

const PRAYER_TYPES: PrayerType[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function isPrayerType(s: unknown): s is PrayerType {
  return typeof s === 'string' && PRAYER_TYPES.includes(s as PrayerType);
}

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('prayer_tracker.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS missed_prayers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prayer_type TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Database initialized
  } catch (error) {
    throw error;
  }
};

// Settings functions
export const getSetting = async (key: string): Promise<string | null> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return result?.value ?? null;
  } catch {
    return null;
  }
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  } catch (error) {
    throw error;
  }
};

// City-specific functions
export const getCityName = async (): Promise<string | null> => {
  return getSetting('cityName');
};

export const setCityName = async (cityName: string): Promise<void> => {
  return setSetting('cityName', cityName);
};

export const addMissedPrayer = async (
  prayerType: PrayerType,
  date: string
): Promise<number> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const result = await db.runAsync(
      'INSERT INTO missed_prayers (prayer_type, date, created_at) VALUES (?, ?, datetime("now"))',
      [prayerType, date]
    );
    const id = result?.lastInsertRowId;
    return typeof id === 'number' ? id : 0;
  } catch (error) {
    throw error;
  }
};


export const getAllMissedPrayers = async (): Promise<PrayerData[]> => {
  if (!db) return [];

  try {
    const raw = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM missed_prayers ORDER BY date DESC, created_at DESC'
    );
    const rows = Array.isArray(raw) ? raw : [];

    const prayerMap = new Map<PrayerType, PrayerData>();
    for (const type of PRAYER_TYPES) {
      const c = PRAYER_TYPE_MAP[type];
      prayerMap.set(type, { type, name: c.name, count: 0, items: [], icon: c.icon, iconBg: c.iconBg, iconColor: c.iconColor });
    }

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const pt = row['prayer_type'] ?? row.prayer_type;
      if (!isPrayerType(pt)) continue;

      const rec = prayerMap.get(pt);
      if (!rec) continue;

      const id = row.id != null ? String(row.id) : '';
      const date = typeof row.date === 'string' ? row.date : '';
      if (!id || !date) continue;

      rec.items.push({ id, date });
      rec.count = rec.items.length;
    }

    return Array.from(prayerMap.values()).filter((p) => p.count > 0);
  } catch {
    return [];
  }
};

export const deleteMissedPrayer = async (id: string): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.runAsync('DELETE FROM missed_prayers WHERE id = ?', [id]);
  } catch (error) {
    throw error;
  }
};

export const getTotalCount = async (): Promise<number> => {
  if (!db) return 0;

  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM missed_prayers'
    );
    return result?.count ?? 0;
  } catch {
    return 0;
  }
};
