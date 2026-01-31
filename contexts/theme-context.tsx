import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ThemeColors {
  // Base backgrounds
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accent colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Border colors
  border: string;
  borderLight: string;

  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarIcon: string;
  tabBarIconActive: string;

  // Cards
  cardBackground: string;
  cardBorder: string;

  // Modal
  modalOverlay: string;
  modalBackground: string;

  // Input
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Status
  danger: string;
  success: string;

  // Shadows
  shadowColor: string;
}

export const lightColors: ThemeColors = {
  // Base backgrounds
  background: "#f1f5f9",
  backgroundSecondary: "#ffffff",
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc",

  // Text colors
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  // Accent colors
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",

  // Border colors
  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  // Tab bar
  tabBarBackground: "#ffffff",
  tabBarBorder: "#e2e8f0",
  tabBarIcon: "#94a3b8",
  tabBarIconActive: "#10b981",

  // Cards
  cardBackground: "#ffffff",
  cardBorder: "#e2e8f0",

  // Modal
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  modalBackground: "#ffffff",

  // Input
  inputBackground: "#f8fafc",
  inputBorder: "#e2e8f0",
  inputPlaceholder: "#94a3b8",

  // Status
  danger: "#ef4444",
  success: "#10b981",

  // Shadows
  shadowColor: "#000000",
};

export const darkColors: ThemeColors = {
  // Base backgrounds
  background: "#0f172a",
  backgroundSecondary: "#1e293b",
  surface: "#1e293b",
  surfaceSecondary: "#334155",

  // Text colors
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",

  // Accent colors
  primary: "#10b981",
  primaryLight: "#064e3b",
  primaryDark: "#34d399",

  // Border colors
  border: "#334155",
  borderLight: "#1e293b",

  // Tab bar
  tabBarBackground: "#1e293b",
  tabBarBorder: "#334155",
  tabBarIcon: "#64748b",
  tabBarIconActive: "#10b981",

  // Cards
  cardBackground: "#1e293b",
  cardBorder: "#334155",

  // Modal
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  modalBackground: "#1e293b",

  // Input
  inputBackground: "#334155",
  inputBorder: "#475569",
  inputPlaceholder: "#64748b",

  // Status
  danger: "#f87171",
  success: "#34d399",

  // Shadows
  shadowColor: "#000000",
};

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "@pray_track_theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark") {
          setIsDark(true);
        }
      } catch {
        // Silent fail - use default theme
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Save theme when it changes
  const saveTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Silent fail - theme preference won't be persisted
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newMode = !prev;
      saveTheme(newMode ? "dark" : "light");
      return newMode;
    });
  }, [saveTheme]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      const newIsDark = mode === "dark";
      setIsDark(newIsDark);
      saveTheme(mode);
    },
    [saveTheme]
  );

  const colors = isDark ? darkColors : lightColors;

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
