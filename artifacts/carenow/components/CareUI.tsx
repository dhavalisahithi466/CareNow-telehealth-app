import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function Page({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  if (!scroll) {
    return (
      <SafeAreaView
        style={[
          styles.page,
          {
            backgroundColor: colors.background,
            paddingTop: Platform.OS === 'web' ? 67 : 0,
            paddingBottom: Platform.OS === 'web' ? 34 : 0,
          },
        ]}
      >
        {children}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={[
        styles.page,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'web' ? 67 : 0,
          paddingBottom: Platform.OS === 'web' ? 34 : 0,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.heading}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionText, { color: colors.foreground }]}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  title,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
}: {
  title: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress: PressableProps['onPress'];
  variant?: 'primary' | 'danger' | 'outline' | 'soft';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  const buttonColor =
    variant === 'danger'
      ? colors.destructive
      : variant === 'soft'
        ? colors.primarySoft
        : variant === 'outline'
          ? colors.card
          : colors.primary;
  const textColor =
    variant === 'danger'
      ? colors.destructiveForeground
      : variant === 'soft'
        ? colors.primary
        : variant === 'outline'
          ? colors.foreground
          : colors.primaryForeground;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: buttonColor,
          borderColor: variant === 'outline' ? colors.border : buttonColor,
          opacity: disabled ? 0.48 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={textColor} /> : null}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function InfoNotice({
  title,
  body,
  tone = 'neutral',
  icon,
}: {
  title: string;
  body: string;
  tone?: 'neutral' | 'danger' | 'warning';
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const colors = useColors();
  const background =
    tone === 'danger'
      ? colors.dangerSoft
      : tone === 'warning'
        ? colors.accent
        : colors.primarySoft;
  const accent =
    tone === 'danger'
      ? colors.destructive
      : tone === 'warning'
        ? colors.warning
        : colors.primary;
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: background, borderColor: colors.border },
      ]}
      accessibilityRole="summary"
    >
      {icon ? <Feather name={icon} size={18} color={accent} /> : null}
      <View style={styles.noticeCopy}>
        <Text style={[styles.noticeTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

export function ActionTile({
  title,
  body,
  icon,
  onPress,
  accent = 'primary',
  testID,
}: {
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  accent?: 'primary' | 'danger' | 'warm';
  testID?: string;
}) {
  const colors = useColors();
  const iconColor =
    accent === 'danger'
      ? colors.destructive
      : accent === 'warm'
        ? colors.warning
        : colors.primary;
  const iconBackground =
    accent === 'danger'
      ? colors.dangerSoft
      : accent === 'warm'
        ? colors.accent
        : colors.primarySoft;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: iconBackground }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.actionBody, { color: colors.mutedForeground }]}>
          {body}
        </Text>
      </View>
      <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function ListDivider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    gap: 20,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  heading: { gap: 7 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: '700', letterSpacing: -0.5 },
  description: { fontSize: 15, lineHeight: 22 },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionText: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  noticeCopy: { flex: 1, gap: 4 },
  noticeTitle: { fontSize: 14, fontWeight: '700' },
  noticeBody: { fontSize: 13, lineHeight: 19 },
  actionTile: {
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionBody: { fontSize: 13, lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
});
