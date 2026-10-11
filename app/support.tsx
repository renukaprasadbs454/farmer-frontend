import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useT } from '../src/i18n';
import { MOCK_FAQS } from '../src/services/mockTrustData';
import { useTrustStore } from '../src/store/trustStore';

export default function HelpSupportScreen() {
  const t = useT();
  const router = useRouter();

  const { tickets, createSupportTicket } = useTrustStore();

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [ticketModalVisible, setTicketModalVisible] = useState<boolean>(false);
  const [category, setCategory] = useState<any>('Crop Sale');
  const [description, setDescription] = useState<string>('');

  const handleSubmitTicket = () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description of the issue.');
      return;
    }
    createSupportTicket(category, description);
    setTicketModalVisible(false);
    setDescription('');
    Alert.alert('Problem Reported', 'Our support team will review your report shortly.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🎧 Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Support Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>👩‍🌾</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Farmer Helpline & Support</Text>
            <Text style={styles.bannerSub}>We are here to assist you with services, orders, and sales.</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.actionBtn} onPress={() => setTicketModalVisible(true)}>
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionTitle}>Report Problem</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={() => Alert.alert('Toll-Free Helpline', 'Call 1800-123-FARM (3276)')}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionTitle}>Call Support</Text>
          </Pressable>
        </View>

        {/* FAQs Accordion Section */}
        <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
        {MOCK_FAQS.map((faq, idx) => {
          const isOpen = expandedFaqIndex === idx;
          return (
            <View key={idx} style={styles.faqCard}>
              <Pressable
                style={styles.faqHeader}
                onPress={() => setExpandedFaqIndex(isOpen ? null : idx)}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqChevron}>{isOpen ? '▲' : '▼'}</Text>
              </Pressable>
              {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </View>
          );
        })}

        {/* Submitted Support Tickets History */}
        {tickets.length > 0 && (
          <View style={{ marginTop: spacing.l }}>
            <Text style={styles.sectionTitle}>📋 Your Reported Tickets ({tickets.length})</Text>
            {tickets.map((t) => (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketCat}>{t.category}</Text>
                  <Text style={styles.ticketStatus}>{t.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.ticketDesc}>{t.description}</Text>
                <Text style={styles.ticketDate}>{t.createdAt}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Report Ticket Modal */}
      <Modal
        visible={ticketModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTicketModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Report a Problem</Text>
              <Pressable onPress={() => setTicketModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipRow}>
              {['Order', 'Labour', 'Machinery', 'Product', 'Crop Sale', 'Other'].map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c as any)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Describe the issue</Text>
            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Provide details so our team can assist you..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Pressable style={styles.submitModalBtn} onPress={handleSubmitTicket}>
              <Text style={styles.submitModalBtnText}>Submit Support Ticket</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: font.medium, color: colors.primary, fontSize: 14 },
  headerTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
  content: { padding: spacing.m },
  banner: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.m,
    padding: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  bannerIcon: { fontSize: 32 },
  bannerTitle: { fontFamily: font.bold, fontSize: 15, color: colors.textPrimary },
  bannerSub: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary },
  btnRow: { flexDirection: 'row', gap: spacing.m, marginBottom: spacing.l },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionTitle: { fontFamily: font.bold, fontSize: 13, color: colors.textPrimary },
  sectionTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.s },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontFamily: font.bold, fontSize: 14, color: colors.textPrimary, flex: 1 },
  faqChevron: { fontSize: 12, color: colors.textMuted, marginLeft: spacing.s },
  faqAnswer: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 18 },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  ticketCat: { fontFamily: font.bold, fontSize: 13, color: colors.textPrimary },
  ticketStatus: { fontFamily: font.bold, fontSize: 10, color: colors.primary },
  ticketDesc: { fontFamily: font.regular, fontSize: 13, color: colors.textSecondary },
  ticketDate: { fontFamily: font.regular, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.l, borderTopRightRadius: radius.l, padding: spacing.m },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  modalTitle: { fontFamily: font.bold, fontSize: 18, color: colors.textPrimary },
  closeBtn: { fontSize: 20, color: colors.textMuted },
  inputLabel: { fontFamily: font.bold, fontSize: 13, color: colors.textPrimary, marginTop: spacing.s, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginBottom: spacing.s },
  chip: { backgroundColor: colors.background, paddingHorizontal: spacing.m, paddingVertical: spacing.s, borderRadius: radius.s, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontFamily: font.medium, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { fontFamily: font.bold, color: colors.primary },
  modalInput: { backgroundColor: colors.background, borderRadius: radius.s, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.m, paddingTop: spacing.s, fontFamily: font.regular, fontSize: 14 },
  submitModalBtn: { backgroundColor: colors.primary, borderRadius: radius.s, paddingVertical: spacing.m, alignItems: 'center', marginTop: spacing.m },
  submitModalBtnText: { fontFamily: font.bold, fontSize: 16, color: colors.surface },
});
