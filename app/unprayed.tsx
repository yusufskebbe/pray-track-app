import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/theme-context";
import {
  deleteMissedPrayer,
  getAllMissedPrayers,
  getTotalCount,
} from "../services/database.service";
import { PrayerData, PrayerType } from "../types/prayer.types";

export default function UnprayedScreen() {
  const { colors } = useTheme();
  const [prayers, setPrayers] = useState<PrayerData[]>([]);
  const [totalUnprayedCount, setTotalUnprayedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPrayers, setExpandedPrayers] = useState<Set<PrayerType>>(
    new Set()
  );

  const loadPrayers = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prayersData, totalCount] = await Promise.all([
        getAllMissedPrayers(),
        getTotalCount(),
      ]);
      setPrayers(prayersData);
      setTotalUnprayedCount(totalCount);
    } catch {
      Alert.alert("Hata", "Namazlar yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load prayers when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPrayers();
    }, [loadPrayers])
  );

  // Calculate indicator value (percentage completed this week)
  // For now, we'll use a simple calculation based on total count
  // You can enhance this later with actual completion tracking
  const indicatorValue =
    totalUnprayedCount > 0
      ? Math.min(
          100,
          Math.round(
            (totalUnprayedCount / Math.max(totalUnprayedCount, 20)) * 100
          )
        )
      : 0;

  const formatDateTR = (isoDate: string): string => {
    const [y, m, d] = isoDate.split("-");
    return `${d}.${m}.${y}`;
  };

  const togglePrayer = (type: PrayerType) => {
    setExpandedPrayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleDeletePrayer = (id: string, date: string) => {
    Alert.alert(
      "Kaza Namazını Sil",
      `${date} tarihli kaza namazını silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMissedPrayer(id);
              await loadPrayers(); // Refresh the list
            } catch {
              Alert.alert("Hata", "Namaz silinirken bir hata oluştu.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Info Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.gradientBlur} />
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Telafi Edilecek Toplam</Text>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
            </View>

            <View style={styles.countContainer}>
              <Text style={styles.countText}>{totalUnprayedCount}</Text>
              <Text style={styles.countLabel}>Namaz</Text>
            </View>

            {/* Line Indicator */}
            <View style={styles.indicatorContainer}>
              <View style={styles.indicatorBackground}>
                <View
                  style={[
                    styles.indicatorProgress,
                    {
                      width: `${indicatorValue}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.infoText}>
                Bu hafta kalan kaza namazlarınızın %{indicatorValue} tamamlandı.
              </Text>
            </View>
          </View>
        </View>

        {/* Prayer Dropdown Lists */}
        <View style={styles.prayersContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Yükleniyor...
              </Text>
            </View>
          ) : prayers.length === 0 ? (
            <View
              style={[
                styles.emptyStateContainer,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text
                style={[styles.emptyStateTitle, { color: colors.textPrimary }]}
              >
                Kaza Namazı Yok
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Henüz kaza namazı eklenmemiş.
              </Text>
            </View>
          ) : (
            prayers.map((prayer) => {
              const isExpanded = expandedPrayers.has(prayer.type);
              return (
                <View
                  key={prayer.type}
                  style={[
                    styles.prayerItem,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.prayerHeader,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() => togglePrayer(prayer.type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.prayerHeaderLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: prayer.iconBg },
                        ]}
                      >
                        <Ionicons
                          name={prayer.icon as "sunny-outline" | "moon-outline"}
                          size={20}
                          color={prayer.iconColor}
                        />
                      </View>
                      <Text
                        style={[
                          styles.prayerName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {prayer.name}{" "}
                        <Text
                          style={[
                            styles.prayerCountText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          ({prayer.count})
                        </Text>
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View
                      style={[
                        styles.dropdownContent,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderTopColor: colors.borderLight,
                        },
                      ]}
                    >
                      {prayer.items.length > 0 ? (
                        prayer.items.map((item, index) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.prayerListItem,
                              { borderBottomColor: colors.borderLight },
                              index === prayer.items.length - 1 &&
                                styles.prayerListItemLast,
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.prayerListItemDate,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {formatDateTR(item.date)}
                            </Text>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              activeOpacity={0.7}
                              onPress={() =>
                                handleDeletePrayer(item.id, item.date)
                              }
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color={colors.textMuted}
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyState}>
                          <Text
                            style={[
                              styles.emptyStateText,
                              { color: colors.textMuted },
                            ]}
                          >
                            Kaza namazı bulunmuyor
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginTop: 30,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  cardWrapper: {
    position: "relative",
    marginBottom: 24,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBlur: {
    position: "absolute",
    right: -24,
    top: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    zIndex: 0,
  },
  glassCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(248, 250, 252, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    lineHeight: 16,
    flex: 1,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 16,
  },
  countText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  countLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#cbd5e1",
  },
  indicatorContainer: {
    marginTop: 4,
  },
  indicatorBackground: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  indicatorProgress: {
    height: "100%",
    borderRadius: 3,
    shadowColor: "#10b981",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#94a3b8",
    lineHeight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  prayersContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },
  prayerItem: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  prayerHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  prayerCountText: {
    fontWeight: "400",
  },
  dropdownContent: {
    borderTopWidth: 1,
  },
  prayerListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 72,
    paddingRight: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  prayerListItemLast: {
    borderBottomWidth: 0,
  },
  prayerListItemDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "400",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
});
