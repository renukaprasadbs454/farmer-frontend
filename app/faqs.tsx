import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useT } from '../src/i18n';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  id: string;
  category: 'General' | 'Services' | 'Market' | 'Payments' | 'Help';
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is Farmer Mate?',
    answer:
      'Farmer Mate is an all-in-one agricultural platform built for Indian farmers. It helps you rent farm machinery (tractors, harvesters), book agricultural labor teams with verified dispatch, buy agri-inputs, sell harvested crops directly to buyers without middlemen, and get instant guidance from expert agronomists via text and voice notes.',
  },
  {
    id: '2',
    category: 'General',
    question: 'How do I change the application language?',
    answer:
      'You can switch languages anytime from the "My Farm" tab. We currently support English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी) with seamless translation across all screens.',
  },
  {
    id: '3',
    category: 'Services',
    question: 'How does Labour Booking work? Why is worker identity confidential?',
    answer:
      'We protect both worker privacy and farmer security through verified, confidential dispatch. You select the agricultural service needed (e.g., harvesting, weeding, transplanting, pruning) and the date. Our local franchise hub verifies and assigns trained worker teams. You only see service rates and dispatch status without bias or safety risks.',
  },
  {
    id: '4',
    category: 'Services',
    question: 'How do I hire tractors, tillers, or harvesters?',
    answer:
      'Go to the "Services" tab and select "Machinery". Choose the vehicle type (Tractor, Power Tiller, JCB, Harvester, Drone Sprayer), specify your acreage, select your preferred date, and submit. The local equipment owner will confirm dispatch and arrive at your farm location.',
  },
  {
    id: '5',
    category: 'Market',
    question: 'Can I sell my harvested crops directly on Farmer Mate?',
    answer:
      'Yes! Tap "Market" and click "Sell Crops". Enter your crop name, expected quantity in quintals or bags, rate per quintal, and harvest availability date. Verified wholesale buyers and millers in your district can view your listing and send purchase requests.',
  },
  {
    id: '6',
    category: 'Market',
    question: 'Are there any commission fees for selling crops?',
    answer:
      'Farmer Mate does not charge hefty broker commissions. We connect farmers directly with buyers and local franchise clusters so you get maximum profits for your harvest.',
  },
  {
    id: '7',
    category: 'Payments',
    question: 'What payment modes are accepted?',
    answer:
      'We support Cash on Delivery (COD) / Direct Farm Settlement, UPI (Google Pay, PhonePe, Paytm), and Net Banking. For labor and machinery services, you can pay directly after the work is verified on your field.',
  },
  {
    id: '8',
    category: 'Help',
    question: 'How do I talk to an Agri Expert or get crop disease advice?',
    answer:
      'Tap the center "Agri Chat" button (💬) in the bottom navigation bar. You can type questions, send voice notes in your native language, or upload pictures of affected crop leaves or pest damage. Our agronomists review and reply directly through the app.',
  },
  {
    id: '9',
    category: 'Help',
    question: 'What if a booked service is delayed or cancelled?',
    answer:
      'You can contact our support desk or raise an issue directly from the booking status page. Our franchise managers assist you in rescheduling or dispatching an alternative worker or machinery unit immediately.',
  },
];

const CATEGORIES = ['All', 'General', 'Services', 'Market', 'Payments', 'Help'] as const;

export default function FaqsScreen() {
  const router = useRouter();
  const t = useT();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCat = selectedCat === 'All' || faq.category === selectedCat;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={{ fontSize: 32 }}>❓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Farmer Mate Help Center</Text>
            <Text style={styles.bannerSub}>
              Find quick answers to common questions about services, crops, payments, and features.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions (e.g. labour, tractor, crops)..."
            placeholderTextColor="#8898AA"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Text style={{ color: '#888', fontWeight: '700', paddingHorizontal: 4 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.catPill, selectedCat === cat && styles.catPillActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catPillText, selectedCat === cat && styles.catPillTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQs List */}
        <View style={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 32 }}>🌾</Text>
              <Text style={styles.emptyTitle}>No matching answers found</Text>
              <Text style={styles.emptySub}>Try searching with different terms or reach out to our Agri Chat.</Text>
            </View>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <View key={faq.id} style={styles.faqCard}>
                  <Pressable style={styles.faqHeader} onPress={() => toggleExpand(faq.id)}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tagRow}>
                        <Text style={styles.tagText}>{faq.category}</Text>
                      </View>
                      <Text style={styles.questionText}>{faq.question}</Text>
                    </View>
                    <View style={[styles.chevronBadge, isExpanded && styles.chevronBadgeActive]}>
                      <Text style={[styles.chevronText, isExpanded && styles.chevronTextActive]}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Still have questions CTA card */}
        <View style={styles.ctaCard}>
          <Text style={{ fontSize: 28 }}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Still need assistance?</Text>
            <Text style={styles.ctaSub}>
              Talk directly with our Agri Experts via text or voice note in our chat.
            </Text>
          </View>
          <Pressable style={styles.ctaBtn} onPress={() => router.push('/chat' as any)}>
            <Text style={styles.ctaBtnText}>Open Chat</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B3B2B',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#E8F5E9',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: spacing.md,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
  bannerSub: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D7E5DB',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1B3B2B',
  },
  catScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DB',
  },
  catPillActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4C6E53',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  faqList: {
    gap: 10,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    overflow: 'hidden',
    ...shadow.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  tagRow: {
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B3B2B',
    lineHeight: 20,
  },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chevronBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  chevronText: {
    fontSize: 11,
    color: '#63826C',
  },
  chevronTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  answerBox: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F1',
  },
  answerText: {
    fontSize: 13,
    color: '#395341',
    lineHeight: 21,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B3B2B',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#63826C',
    textAlign: 'center',
    marginTop: 4,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    ...shadow.card,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B3B2B',
  },
  ctaSub: {
    fontSize: 11,
    color: '#63826C',
    marginTop: 2,
  },
  ctaBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
