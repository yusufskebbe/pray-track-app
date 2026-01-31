import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { env } from "../../config/env";
import { useAddPrayer } from "../../contexts/add-prayer-context";
import { useCity } from "../../contexts/city-context";
import { useTheme } from "../../contexts/theme-context";
import { addMissedPrayer } from "../../services/database.service";
import { PRAYER_TYPE_OPTIONS, PrayerType } from "../../types/prayer.types";

export default function HomeTabScreen() {
  const router = useRouter();
  const { isAddModalVisible, openAddModal, closeAddModal } = useAddPrayer();
  const { colors } = useTheme();
  const { cityName, isLoading: isCityLoading } = useCity();
  const [selectPrayType, setSelectPrayType] = useState<PrayerType | "">("");
  const [isPrayerTypePickerVisible, setIsPrayerTypePickerVisible] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString("tr-TR", { weekday: "long" });
  const day = currentDate.getDate();
  const monthName = currentDate.toLocaleDateString("tr-TR", { month: "short" });

  const [dailyPrayers, setDailyPrayers] = useState<
    { id: number; name: string; time: string; icon: string }[]
  >([]);
  const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState(false);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      if (!cityName) return;

      setIsPrayerTimesLoading(true);
      try {
        const city = cityName
          .toLocaleLowerCase("tr-TR")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const encodedCity = encodeURIComponent(city);
        const url = `${env.prayerApiUrl}?city=${encodedCity}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `apikey ${env.prayerApiKey}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API request failed: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();

        const prayerIcons: Record<string, string> = {
          İmsak: "sunny-outline",
          Öğle: "sunny-outline",
          İkindi: "sunny-outline",
          Akşam: "sunny-outline",
          Yatsı: "moon-outline",
        };

        if (data?.result && Array.isArray(data.result)) {
          const mappedPrayers = data.result
            .filter((p: { vakit: string }) => prayerIcons[p.vakit])
            .map((prayer: { vakit: string; saat: string }, index: number) => ({
              id: index + 1,
              name: prayer.vakit,
              time: prayer.saat,
              icon: prayerIcons[prayer.vakit],
            }));
          setDailyPrayers(mappedPrayers);
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setIsPrayerTimesLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [cityName]);

  const formatDateForDB = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleAddPrayer = async () => {
    if (!selectPrayType) {
      Alert.alert("Hata", "Lütfen namaz tipi seçin.");
      return;
    }

    setIsSaving(true);
    try {
      const formattedDate = formatDateForDB(selectedDate);
      await addMissedPrayer(selectPrayType, formattedDate);

      Alert.alert("Başarılı", "Kaza namazı başarıyla eklendi.", [
        {
          text: "Tamam",
          onPress: () => {
            closeAddModal();
            setSelectPrayType("");
            setSelectedDate(new Date());
          },
        },
      ]);
    } catch {
      Alert.alert(
        "Hata",
        "Kaza namazı eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPrayerType = (type: PrayerType) => {
    setSelectPrayType(type);
    setIsPrayerTypePickerVisible(false);
  };

  const getPrayerTypeLabel = (type: PrayerType | ""): string => {
    if (!type) return "Namaz tipi seçin";
    const option = PRAYER_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label ?? "Namaz tipi seçin";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.dateCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.dateCardContent}>
            <View
              style={[
                styles.dateCardIconWrap,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.dateCardTextWrap}>
              <Text style={[styles.dateCardLabel, { color: colors.primary }]}>
                Bugün
              </Text>
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {dayName}, {day} {monthName}
              </Text>
            </View>
          </View>
        </View>

        <ImageBackground
          source={require("../../assets/my-images/1.jpg")}
          style={styles.indicatorCard}
          imageStyle={styles.cardBackgroundImage}
        >
          <View style={styles.indicatorHeader}>
            <Text style={styles.indicatorTitle}>Günün Hadisi</Text>
          </View>
          <Text style={styles.hadithText}>
            {`"Mü'minin en fazîletlisi, ahlâkı en güzel olanıdır." (Buhârî)`}
          </Text>
        </ImageBackground>

        <View
          style={[
            styles.kazaCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.kazaContent}>
            <View style={styles.kazaInfo}>
              <Ionicons
                name="time-outline"
                size={24}
                color={colors.primary}
                style={styles.kazaIcon}
              />
              <Text style={[styles.kazaLabel, { color: colors.textPrimary }]}>
                Kaza Namazı Ekle
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.kazaButton, { backgroundColor: colors.primary }]}
              onPress={openAddModal}
            >
              <Ionicons name="add" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.unprayedButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={() => router.push("/(tabs)/list")}
        >
          <Ionicons name="list-outline" size={20} color={colors.primary} />
          <Text
            style={[styles.unprayedButtonText, { color: colors.textPrimary }]}
          >
            Kaza Namazları Listesi
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View>
          <Text
            style={[
              styles.dailyPrayersLabelText,
              { color: colors.textPrimary },
            ]}
          >
            Namaz Vakitleri {cityName && `(${cityName})`}
          </Text>
        </View>
        {isCityLoading ? (
          <View
            style={[
              styles.locationMessageCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.locationMessageText,
                { color: colors.textPrimary },
              ]}
            >
              Yükleniyor...
            </Text>
          </View>
        ) : !cityName ? (
          <TouchableOpacity
            style={[
              styles.locationMessageCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => router.push("/(tabs)/settings")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location-outline"
              size={48}
              color={colors.primary}
            />
            <Text
              style={[
                styles.locationMessageText,
                { color: colors.textPrimary },
              ]}
            >
              Lütfen yaşadığınız şehri ayarlar menüsünden seçiniz
            </Text>
            <View
              style={[
                styles.selectCityButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="settings-outline" size={18} color="#ffffff" />
              <Text style={styles.selectCityButtonText}>Ayarlara Git</Text>
            </View>
          </TouchableOpacity>
        ) : isPrayerTimesLoading ? (
          <View
            style={[
              styles.locationMessageCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={48}
              color={colors.primary}
            />
            <Text
              style={[
                styles.locationMessageText,
                { color: colors.textPrimary },
              ]}
            >
              Namaz vakitleri yükleniyor...
            </Text>
          </View>
        ) : dailyPrayers.length > 0 ? (
          <View style={styles.prayersListContainer}>
            {dailyPrayers.map((prayer) => (
              <View
                key={prayer.id}
                style={[
                  styles.prayerCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.prayerIconContainer,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name={prayer.icon as "sunny-outline" | "moon-outline"}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.prayerInfo}>
                  <Text
                    style={[styles.prayerName, { color: colors.textPrimary }]}
                  >
                    {prayer.name}
                  </Text>
                  <Text
                    style={[styles.prayerTime, { color: colors.textSecondary }]}
                  >
                    {prayer.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.locationMessageCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.locationMessageText,
                { color: colors.textPrimary },
              ]}
            >
              Namaz vakitleri yüklenemedi
            </Text>
            <Text
              style={[
                styles.locationMessageSubtext,
                { color: colors.textSecondary },
              ]}
            >
              Lütfen internet bağlantınızı kontrol edin
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          closeAddModal();
          setIsPrayerTypePickerVisible(false);
        }}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.modalBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Kaza Namazı Ekle
              </Text>
              <TouchableOpacity
                onPress={() => {
                  closeAddModal();
                  setIsPrayerTypePickerVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text
                  style={[styles.inputLabel, { color: colors.textPrimary }]}
                >
                  Namaz Tipi
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectContainer,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() =>
                    setIsPrayerTypePickerVisible(!isPrayerTypePickerVisible)
                  }
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: selectPrayType
                          ? colors.textPrimary
                          : colors.inputPlaceholder,
                      },
                    ]}
                  >
                    {getPrayerTypeLabel(selectPrayType)}
                  </Text>
                  <Ionicons
                    name={
                      isPrayerTypePickerVisible ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={colors.textSecondary}
                    style={styles.selectIcon}
                  />
                </TouchableOpacity>
                {isPrayerTypePickerVisible && (
                  <View
                    style={[
                      styles.pickerDropdown,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <ScrollView
                      nestedScrollEnabled
                      style={styles.pickerDropdownScroll}
                      contentContainerStyle={styles.pickerDropdownContent}
                      showsVerticalScrollIndicator
                      keyboardShouldPersistTaps="handled"
                    >
                      {PRAYER_TYPE_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.pickerOption,
                            { borderBottomColor: colors.borderLight },
                            selectPrayType === option.value && {
                              backgroundColor: colors.primaryLight,
                            },
                          ]}
                          onPress={() => handleSelectPrayerType(option.value)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              { color: colors.textPrimary },
                              selectPrayType === option.value && {
                                fontWeight: "600",
                                color: colors.primary,
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                          {selectPrayType === option.value && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color={colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text
                  style={[styles.inputLabel, { color: colors.textPrimary }]}
                >
                  Tarih
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateContainer,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateDisplayText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {formatDateDisplay(selectedDate)}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    locale="tr-TR"
                  />
                )}
                {Platform.OS === "ios" && showDatePicker && (
                  <TouchableOpacity
                    style={[
                      styles.datePickerDone,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Tamam</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primary },
                isSaving && styles.addButtonDisabled,
              ]}
              onPress={handleAddPrayer}
              disabled={isSaving}
            >
              <Text style={styles.addButtonText}>
                {isSaving ? "Ekleniyor..." : "Ekle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  dateCard: {
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  dateCardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  dateCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCardTextWrap: { flex: 1 },
  dateCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  kazaCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  kazaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kazaInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  kazaIcon: { marginRight: 12 },
  kazaLabel: { fontSize: 16, fontWeight: "600" },
  kazaButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  unprayedButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  unprayedButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  indicatorCard: {
    backgroundColor: "black",
    borderRadius: 20,
    marginBottom: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardBackgroundImage: { resizeMode: "cover", opacity: 0.5 },
  hadithText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#fff",
    marginTop: 12,
    fontWeight: "500",
  },
  indicatorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  indicatorTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  dailyPrayersLabelText: {
    fontSize: 18,
    fontWeight: "600",
  },
  prayersListContainer: { marginTop: 24, gap: 12 },
  locationMessageCard: {
    borderRadius: 16,
    padding: 32,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationMessageText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  locationMessageSubtext: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  selectCityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  selectCityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  prayerCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  prayerInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prayerName: { fontSize: 18, fontWeight: "600" },
  prayerTime: { fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  closeButton: { padding: 4 },
  modalBody: { gap: 20 },
  inputContainer: { marginBottom: 4 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  selectText: { flex: 1, fontSize: 16 },
  selectIcon: { marginLeft: 8 },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  dateIcon: { marginLeft: 16 },
  dateDisplayText: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  datePickerDone: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  pickerDropdownScroll: { maxHeight: 220 },
  pickerDropdownContent: { paddingVertical: 4 },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  addButtonDisabled: { opacity: 0.6 },
  pickerDropdown: {
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 260,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerOptionText: { fontSize: 16 },
});
