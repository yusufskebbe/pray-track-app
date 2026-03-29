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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_INCLUSIVE_DAYS = 30;

function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function inclusiveDayCount(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

/** Inserts one row per calendar day from start through end (inclusive). Max 30 inclusive days. */
export const addMissedPrayersForDateRange = async (
  prayerType: PrayerType,
  startDate: string,
  endDate: string
): Promise<number> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  if (!ISO_DATE_RE.test(startDate) || !ISO_DATE_RE.test(endDate)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  let start = parseIsoDateLocal(startDate);
  let end = parseIsoDateLocal(endDate);
  if (start > end) {
    throw new Error('INVALID_RANGE_ORDER');
  }

  const days = inclusiveDayCount(start, end);
  if (days > MAX_RANGE_INCLUSIVE_DAYS) {
    throw new Error('RANGE_TOO_LONG');
  }

  const dateStrings: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endNorm = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= endNorm) {
    dateStrings.push(formatIsoLocal(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  let inserted = 0;
  await db.withTransactionAsync(async () => {
    for (const dateStr of dateStrings) {
      await db!.runAsync(
        'INSERT INTO missed_prayers (prayer_type, date, created_at) VALUES (?, ?, datetime("now"))',
        [prayerType, dateStr]
      );
      inserted += 1;
    }
  });

  return inserted;
};

/** Inserts one missed row per prayer type (all five) for a single calendar day. */
export const addAllDailyMissedPrayersForDate = async (
  date: string
): Promise<number> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  if (!ISO_DATE_RE.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  let inserted = 0;
  await db.withTransactionAsync(async () => {
    for (const prayerType of PRAYER_TYPES) {
      await db!.runAsync(
        'INSERT INTO missed_prayers (prayer_type, date, created_at) VALUES (?, ?, datetime("now"))',
        [prayerType, date]
      );
      inserted += 1;
    }
  });

  return inserted;
};

/** For each day in range (inclusive), inserts all five prayer types. Max 30 inclusive days. */
export const addAllDailyMissedPrayersForDateRange = async (
  startDate: string,
  endDate: string
): Promise<number> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  if (!ISO_DATE_RE.test(startDate) || !ISO_DATE_RE.test(endDate)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  let start = parseIsoDateLocal(startDate);
  let end = parseIsoDateLocal(endDate);
  if (start > end) {
    throw new Error('INVALID_RANGE_ORDER');
  }

  const days = inclusiveDayCount(start, end);
  if (days > MAX_RANGE_INCLUSIVE_DAYS) {
    throw new Error('RANGE_TOO_LONG');
  }

  const dateStrings: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endNorm = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= endNorm) {
    dateStrings.push(formatIsoLocal(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  let inserted = 0;
  await db.withTransactionAsync(async () => {
    for (const dateStr of dateStrings) {
      for (const prayerType of PRAYER_TYPES) {
        await db!.runAsync(
          'INSERT INTO missed_prayers (prayer_type, date, created_at) VALUES (?, ?, datetime("now"))',
          [prayerType, dateStr]
        );
        inserted += 1;
      }
    }
  });

  return inserted;
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
