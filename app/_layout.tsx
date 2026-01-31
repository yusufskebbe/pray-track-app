import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AddPrayerProvider } from "../contexts/add-prayer-context";
import { CityProvider } from "../contexts/city-context";
import { ThemeProvider, useTheme } from "../contexts/theme-context";
// TODO: Re-enable location feature after MVP
// import { useLocation } from "../hooks/use-location";
import { initDatabase } from "../services/database.service";

function RootLayoutContent() {
  // TODO: Re-enable location feature after MVP
  // const { getCurrentLocation, hasPermission, error } = useLocation();
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

      // TODO: Re-enable location feature after MVP
      // const location = await getCurrentLocation();
      // if (location) {
      //   console.log("Location obtained:", location);
      // } else if (error && hasPermission === false) {
      //   Alert.alert(
      //     "Konum İzni Gerekli",
      //     "Namaz vakitleri için konumunuza erişim gerekiyor. Lütfen cihaz ayarlarından konum erişimini etkinleştirin.",
      //     [{ text: "Tamam", style: "default" }]
      //   );
      // }
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
