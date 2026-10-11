import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing, TOUCH } from '../constants/theme';
import { useT } from '../i18n';
import { AvailabilityStatus, PricingType, ServiceType } from '../types';
import { Button } from './Button';
import { Chip } from './Chip';

interface FilterConfig {
  maxDistance: number;
  pricingType: PricingType | 'any';
  minRating: number;
  availability: AvailabilityStatus | 'any';
  operatorIncluded?: boolean | null;
}

type Props = {
  visible: boolean;
  serviceType: ServiceType;
  initialValues: FilterConfig;
  onApply: (values: FilterConfig) => void;
  onReset: () => void;
  onClose: () => void;
};

const DISTANCE_OPTIONS = [5, 10, 20, 50, 100];
const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5];

export function FilterSheet({ visible, serviceType, initialValues, onApply, onReset, onClose }: Props) {
  const t = useT();
  const [draft, setDraft] = useState<FilterConfig>(initialValues);

  const patch = (p: Partial<FilterConfig>) => setDraft((d) => ({ ...d, ...p }));

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={s.title}>{t('filters')}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
            {/* Distance */}
            <Text style={s.section}>{t('maxDistance')}</Text>
            <View style={s.chipRow}>
              {DISTANCE_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  label={`${d} km`}
                  selected={draft.maxDistance === d}
                  onPress={() => patch({ maxDistance: d })}
                />
              ))}
            </View>

            {/* Pricing type */}
            <Text style={s.section}>{t('pricingType')}</Text>
            <View style={s.chipRow}>
              {(['any', 'hourly', 'daily'] as const).map((p) => (
                <Chip
                  key={p}
                  label={p === 'any' ? t('anyPricing') : p === 'hourly' ? t('hourly') : t('daily')}
                  selected={draft.pricingType === p}
                  onPress={() => patch({ pricingType: p })}
                />
              ))}
              {serviceType === 'machinery' && (
                <Chip
                  label={t('perAcre') as string}
                  selected={draft.pricingType === 'per_acre'}
                  onPress={() => patch({ pricingType: 'per_acre' })}
                />
              )}
            </View>

            {/* Rating */}
            <Text style={s.section}>{t('minRating')}</Text>
            <View style={s.chipRow}>
              {RATING_OPTIONS.map((r) => (
                <Chip
                  key={r}
                  label={r === 0 ? t('all') : `⭐ ${r}+`}
                  selected={draft.minRating === r}
                  onPress={() => patch({ minRating: r })}
                />
              ))}
            </View>

            {/* Availability */}
            <Text style={s.section}>{t('availability')}</Text>
            <View style={s.chipRow}>
              {(['any', 'available_today', 'available_tomorrow'] as const).map((a) => (
                <Chip
                  key={a}
                  label={
                    a === 'any'
                      ? t('anyAvailability')
                      : a === 'available_today'
                        ? t('availableToday')
                        : t('availableTomorrow')
                  }
                  selected={draft.availability === a}
                  onPress={() => patch({ availability: a })}
                />
              ))}
            </View>

            {/* Operator (machinery only) */}
            {serviceType === 'machinery' && (
              <>
                <Text style={s.section}>{t('operatorIncludedFilter')}</Text>
                <View style={s.chipRow}>
                  <Chip label={t('anyOperator')} selected={draft.operatorIncluded == null} onPress={() => patch({ operatorIncluded: null })} />
                  <Chip label={t('yes')} selected={draft.operatorIncluded === true} onPress={() => patch({ operatorIncluded: true })} />
                  <Chip label={t('no')} selected={draft.operatorIncluded === false} onPress={() => patch({ operatorIncluded: false })} />
                </View>
              </>
            )}
          </ScrollView>

          <View style={s.actions}>
            <Button title={t('resetFilters')} variant="outline" onPress={handleReset} style={{ flex: 1 }} />
            <Button title={t('applyFilters')} onPress={handleApply} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 8,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.md,
  },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  section: { fontSize: font.body, fontWeight: '700', color: colors.ink, marginTop: spacing.md, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: spacing.lg },
});
