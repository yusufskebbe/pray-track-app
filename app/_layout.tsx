import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AddPrayerProvider, useAddPrayer } from "../contexts/add-prayer-context";
import { CityProvider } from "../contexts/city-context";
import { ThemeProvider, useTheme } from "../contexts/theme-context";
import { initDatabase } from "../services/database.service";
import {
  getNotificationEnabled,
  requestNotificationPermissions,
  scheduleDailyReminder,
} from "../services/notification.service";

function NotificationHandler() {
  const { openAddModal } = useAddPrayer();

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (
        response?.notification.request.content.data?.action === "open_add_modal"
      ) {
        openAddModal();
      }
    });

    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.action === "open_add_modal") {
          openAddModal();
        }
      });

    return () => subscription.remove();
  }, [openAddModal]);

  return null;
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
      } catch {
        Alert.alert("Veritabanı Hatası", "Veritabanı başlatılamadı.", [
          { text: "Tamam", style: "default" },
        ]);
      } finally {
        setDbReady(true);
      }

      const isEnabled = await getNotificationEnabled();
      if (isEnabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await scheduleDailyReminder();
        }
      }
    };

    initializeApp();
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <CityProvider>
        <AddPrayerProvider>
          <NotificationHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </AddPrayerProvider>
      </CityProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
