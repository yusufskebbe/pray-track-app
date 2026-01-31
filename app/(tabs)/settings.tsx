import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCity } from "../../contexts/city-context";
import { useTheme } from "../../contexts/theme-context";

const TURKEY_CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

export default function SettingsTabScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { cityName, setCityName } = useCity();
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  const handleSelectCity = async (city: string) => {
    await setCityName(city);
    setIsCityModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Ayarlar
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Görünüm
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.settingTextWrap}>
                  <Text
                    style={[styles.settingLabel, { color: colors.textPrimary }]}
                  >
                    Koyu Tema
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {isDark ? "Koyu tema aktif" : "Açık tema aktif"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Konum
          </Text>
          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={() => setIsCityModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View
                  style={[
                    styles.settingIconWrap,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingTextWrap}>
                  <Text
                    style={[styles.settingLabel, { color: colors.textPrimary }]}
                  >
                    Şehir
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {cityName ?? "Şehir seçiniz"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
      </ScrollView>

      {/* City Selection Modal */}
      <Modal
        visible={isCityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Şehir Seçin
              </Text>
              <Pressable
                onPress={() => setIsCityModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <FlatList
              data={TURKEY_CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    {
                      borderBottomColor: colors.borderLight,
                      backgroundColor:
                        cityName === item ? colors.primaryLight : "transparent",
                    },
                  ]}
                  onPress={() => handleSelectCity(item)}
                >
                  <Text
                    style={[
                      styles.cityItemText,
                      {
                        color:
                          cityName === item
                            ? colors.primary
                            : colors.textPrimary,
                        fontWeight: cityName === item ? "600" : "400",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {cityName === item && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: "400",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: 4,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  cityItemText: {
    fontSize: 16,
  },
});
