import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, font } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useFarmerStore } from '../../src/store/farmerStore';

export default function Otp() {
  const t = useT();
  const router = useRouter();
  const { mobile, verifyOtp, loading, error } = useAuthStore();
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    const success = await verifyOtp(otp);
    if (success) {
      const onboarded = useFarmerStore.getState().onboarded;
      if (onboarded) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/farmer');
      }
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: font.title, fontWeight: '800', color: colors.ink }}>{t('enterOtp')}</Text>
      <Text style={{ fontSize: font.body, color: colors.muted, marginVertical: 12 }}>+91 {mobile}</Text>
      <Input placeholder="• • • •" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} error={error} />
      <Button title={t('verify')} onPress={handleVerify} loading={loading} disabled={otp.length < 4} />
    </ScreenContainer>
  );
}
