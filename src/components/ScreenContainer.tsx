import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, MAX_WIDTH, spacing } from '../constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  tab?: boolean;
  centered?: boolean;
  style?: ViewStyle;
};

// tab screens sit above the tab bar, which already handles the bottom inset.
export function ScreenContainer({ children, scroll = true, tab, centered, style }: Props) {
  return (
    <SafeAreaView style={s.root} edges={tab ? ['top'] : ['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[s.content, centered && s.centered, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[s.content, { flex: 1 }, centered && s.centered, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
  },
});
