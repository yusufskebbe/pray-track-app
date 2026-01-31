export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface MissedPrayer {
  id: string;
  prayer_type: PrayerType;
  date: string;
  created_at: string;
}

export interface PrayerItem {
  id: string;
  date: string;
}

export interface PrayerData {
  type: PrayerType;
  name: string;
  count: number;
  items: PrayerItem[];
  icon: string;
  iconBg: string;
  iconColor: string;
}

/** DB/internal key = English; name = Turkish for UI */
export const PRAYER_TYPE_MAP: Record<PrayerType, { name: string; icon: string; iconBg: string; iconColor: string }> = {
  fajr: { name: 'İmsak', icon: 'sunny-outline', iconBg: '#fed7aa', iconColor: '#fb923c' },
  dhuhr: { name: 'Öğle', icon: 'sunny-outline', iconBg: '#fef3c7', iconColor: '#f59e0b' },
  asr: { name: 'İkindi', icon: 'sunny-outline', iconBg: '#dbeafe', iconColor: '#3b82f6' },
  maghrib: { name: 'Akşam', icon: 'sunny-outline', iconBg: '#e9d5ff', iconColor: '#a855f7' },
  isha: { name: 'Yatsı', icon: 'moon-outline', iconBg: '#e0e7ff', iconColor: '#6366f1' },
};

export const PRAYER_TYPE_OPTIONS: { value: PrayerType; label: string }[] = [
  { value: 'fajr', label: 'İmsak' },
  { value: 'dhuhr', label: 'Öğle' },
  { value: 'asr', label: 'İkindi' },
  { value: 'maghrib', label: 'Akşam' },
  { value: 'isha', label: 'Yatsı' },
];
