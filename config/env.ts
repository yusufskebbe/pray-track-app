/**
 * Environment configuration for the app
 * Uses Expo's environment variable system (EXPO_PUBLIC_* prefix)
 */

interface EnvConfig {
  prayerApiUrl: string;
  prayerApiKey: string;
}

const getEnvConfig = (): EnvConfig => {
  const prayerApiUrl = process.env.EXPO_PUBLIC_PRAYER_API_URL ?? '';
  const prayerApiKey = process.env.EXPO_PUBLIC_PRAYER_API_KEY ?? '';

  return {
    prayerApiUrl,
    prayerApiKey,
  };
};

export const env = getEnvConfig();
