import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, font } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useFarmerStore } from '../../src/store/farmerStore';

export default function Login() {
  const t = useT();
  const router = useRouter();
  const { sendOtp, loading, error } = useAuthStore();
  const setFarmer = useFarmerStore((s) => s.setFarmer);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const submit = async () => {
    if (await sendOtp(mobile)) {
      setFarmer({ mobile, email: email.trim() || undefined });
      router.push('/otp');
    }
  };

  return (
    <ScreenContainer centered>
      <View style={s.form}>
        <Text style={s.title}>{t('mobile')}</Text>
        <Input
          placeholder="98765 43210"
          keyboardType="number-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
          error={error}
        />
        <Input
          label={t('emailOptional')}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Button title={t('sendOtp')} onPress={submit} loading={loading} disabled={mobile.length !== 10} />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  form: {
    width: '100%',
  },
  title: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 24,
  },
});
