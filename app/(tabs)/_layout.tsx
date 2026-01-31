import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddPrayer } from "../../contexts/add-prayer-context";
import { useTheme } from "../../contexts/theme-context";

const ICON_SIZE = 24;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { openAddModal } = useAddPrayer();
  const { colors, isDark, toggleTheme } = useTheme();

  // Define the order: home, theme, add, list, settings
  const tabOrder = ["index", "theme", "add", "list", "settings"];

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {tabOrder.map((tabName) => {
        // Theme toggle button (not a real tab)
        if (tabName === "theme") {
          return (
            <TouchableOpacity
              key="theme"
              style={styles.tabItem}
              onPress={toggleTheme}
              accessibilityLabel={
                isDark ? "Açık temaya geç" : "Koyu temaya geç"
              }
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={ICON_SIZE}
                color={colors.tabBarIcon}
              />
            </TouchableOpacity>
          );
        }

        // Add button (not a real tab)
        if (tabName === "add") {
          return (
            <TouchableOpacity
              key="add"
              style={styles.tabItem}
              onPress={openAddModal}
              accessibilityLabel="Kaza namazı ekle"
            >
              <Ionicons
                name="add-circle-outline"
                size={ICON_SIZE}
                color={colors.tabBarIcon}
              />
            </TouchableOpacity>
          );
        }

        // Find the route for this tab
        const routeIndex = state.routes.findIndex((r) => r.name === tabName);
        if (routeIndex === -1) return null;

        const route = state.routes[routeIndex];
        const { options } = descriptors[route.key];
        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            {options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? colors.tabBarIconActive : colors.tabBarIcon,
              size: ICON_SIZE,
            })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Ana sayfa",
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "Liste",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Kaza namazları listesi",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Ayarlar",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
});
