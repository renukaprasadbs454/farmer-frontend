import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';
import { useT } from '../i18n';
import { Button } from './Button';
import { ScreenContainer } from './ScreenContainer';

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
};

const TOTAL = 4; // farmer → farm → land → crops (location step removed)
const STEP_LABELS = ['About You', 'Farm Location', 'Farm Setup', 'Soil & Crops'];

export function OnboardingShell({ step, title, subtitle, children, onNext, onBack, nextLabel, nextDisabled, loading }: Props) {
  const t = useT();
  return (
    <ScreenContainer>
      {/* Progress bar */}
      <View style={s.progressContainer}>
        <View style={s.bar}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <View key={i} style={[s.seg, i < step && { backgroundColor: colors.primary }]} />
          ))}
        </View>
        <Text style={s.stepText}>
          Step {step} of {TOTAL} — {STEP_LABELS[step - 1] || ''}
        </Text>
      </View>

      {onBack ? (
        <Pressable onPress={onBack} style={s.back} accessibilityRole="button">
          <Text style={s.backText}>← {t('back')}</Text>
        </Pressable>
      ) : null}

      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>{children}</View>

      <View style={{ marginTop: spacing.lg }}>
        <Button title={nextLabel ?? t('next')} onPress={onNext} disabled={nextDisabled} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  progressContainer: { marginBottom: spacing.md },
  bar: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  seg: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  stepText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontSize: font.body, color: colors.primary, fontWeight: '600' },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: font.body, color: colors.muted, marginTop: 6, lineHeight: 26 },
});
