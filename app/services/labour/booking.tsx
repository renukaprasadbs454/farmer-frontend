import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { labourService } from '../../../src/services/labourService';
import { useBookingStore } from '../../../src/store/bookingStore';
import { useFarmerStore } from '../../../src/store/farmerStore';
import { Labourer } from '../../../src/types';

export default function LabourBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const farm = useFarmerStore((s) => s.farm);
  const createBooking = useBookingStore((s) => s.createBooking);

  const [labourer, setLabourer] = useState<Labourer | null>(null);
  const [workType, setWorkType] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState('6');
  const [workers, setWorkers] = useState('1');
  const [notes, setNotes] = useState('');
  const [pricingType, setPricingType] = useState<'hourly' | 'daily'>('daily');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const farmLocation = [farm.village, farm.district, farm.state].filter(Boolean).join(', ');

  useEffect(() => {
    if (!id) return;
    labourService.getLabourerById(id).then(setLabourer);
  }, [id]);

  if (!labourer) return null;

  const unitRate = pricingType === 'daily' ? labourer.dailyRate : labourer.hourlyRate;
  const numWorkers = Math.max(1, parseInt(workers, 10) || 1);
  const numDuration = Math.max(1, parseInt(duration, 10) || 1);
  const estimatedTotal = pricingType === 'daily'
    ? unitRate * numWorkers
    : unitRate * numDuration * numWorkers;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createBooking({
        type: 'labour',
        labourerId: labourer.id,
        labourerName: labourer.name,
        workType: workType || 'General work',
        numberOfWorkers: numWorkers,
        date,
        startTime,
        duration: numDuration,
        pricingType,
        unitRate,
        estimatedTotal,
        farmLocation,
        additionalInstructions: notes,
        providerDistance: labourer.distance,
      });
      setSuccess(true);
    } catch {
      if (Platform.OS === 'web') {
        alert('Failed to send request. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to send request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.successWrap}>
          <Text style={{ fontSize: 64 }}>✅</Text>
          <Text style={s.successTitle}>{t('requestSent')}</Text>
          <Text style={s.successMsg}>
            {t('requestSentToWorker')} {labourer.name}.
          </Text>
          <Text style={s.successMsg}>{t('trackFromOrders')}</Text>
          <View style={{ gap: 12, marginTop: spacing.lg, width: '100%' }}>
            <Button title={t('viewOrders')} onPress={() => router.replace('/orders')} />
            <Button title={t('backToServices')} variant="outline" onPress={() => router.replace('/services')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Button title={`← ${t('back')}`} variant="outline" onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginBottom: spacing.md }} />

        <Text style={s.title}>{t('bookingDetails')}</Text>
        <Text style={s.subtitle}>{labourer.name}</Text>

        <View style={s.confidentialNote}>
          <Text style={s.confidentialNoteText}>
            🔒 Provider Confidentiality: A verified workforce will be dispatched to your farm on {date}. Individual worker details are confidential.
          </Text>
        </View>

        <Input label={t('workType')} value={workType} onChangeText={setWorkType} placeholder="e.g. Onion harvesting" />
        <Input label={t('date')} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Input label={t('startTime')} value={startTime} onChangeText={setStartTime} placeholder="HH:MM" />
        <Input label={t('duration') + ` (${t('hours')})`} value={duration} onChangeText={setDuration} keyboardType="numeric" />
        <Input label={t('numberOfWorkers')} value={workers} onChangeText={setWorkers} keyboardType="numeric" />

        {/* Pricing toggle */}
        <Text style={s.fieldLabel}>{t('pricingType')}</Text>
        <View style={s.toggleRow}>
          <Button
            title={t('daily')}
            variant={pricingType === 'daily' ? 'primary' : 'outline'}
            onPress={() => setPricingType('daily')}
            style={{ flex: 1 }}
          />
          <Button
            title={t('hourly')}
            variant={pricingType === 'hourly' ? 'primary' : 'outline'}
            onPress={() => setPricingType('hourly')}
            style={{ flex: 1 }}
          />
        </View>

        <Input label={t('farmLocation')} value={farmLocation} editable={false} />
        <Input label={t('additionalInstructions')} value={notes} onChangeText={setNotes} placeholder={t('additionalInstructions')} multiline />

        {/* Cost Summary */}
        <View style={s.summary}>
          <Text style={s.summaryTitle}>{t('estimatedCost')}</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>₹{unitRate} × {numWorkers} {t('workers')}{pricingType === 'hourly' ? ` × ${numDuration}h` : ''}</Text>
            <Text style={s.summaryTotal}>₹{estimatedTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <Button title={t('sendRequest')} onPress={handleSubmit} loading={submitting} style={{ marginTop: spacing.lg }} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: font.body, color: colors.muted, marginBottom: spacing.md },
  confidentialNote: {
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: '#C5E2D0',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  confidentialNoteText: {
    fontSize: 11.5,
    color: '#0F613B',
    fontWeight: '600',
    lineHeight: 16,
  },
  fieldLabel: { fontSize: font.label, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.md },
  summary: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md },
  summaryTitle: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryLabel: { fontSize: font.body, color: colors.ink },
  summaryTotal: { fontSize: font.title, fontWeight: '800', color: colors.primaryDark },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  successTitle: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
  successMsg: { fontSize: font.body, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 26 },
});
