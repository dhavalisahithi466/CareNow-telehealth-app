import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActionTile,
  Card,
  Heading,
  InfoNotice,
  Page,
  SectionTitle,
} from '@/components/CareUI';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const { profile } = useHealthProfile();

  return (
    <Page>
      <View style={styles.topLine}>
        <View style={styles.brand}>
          <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
            <Feather name="heart" size={18} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>
            CareNow
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open health profile"
          testID="home-profile-button"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [
            styles.profileButton,
            { backgroundColor: colors.primarySoft, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Feather name="user" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <Heading
        eyebrow="CARE, WHEN YOU NEED IT"
        title={profile.name ? `Hello, ${profile.name.split(' ')[0]}` : 'A little support, right on time.'}
        description="Find a next step for your health, day or night."
      />

      <Pressable
        accessibilityRole="button"
        testID="home-emergency-button"
        onPress={() => router.push('/emergency')}
        style={({ pressed }) => [
          styles.emergencyCard,
          { backgroundColor: colors.destructive, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.emergencyIcon}>
          <Feather name="phone-call" size={20} color={colors.destructive} />
        </View>
        <View style={styles.emergencyCopy}>
          <Text style={styles.emergencyTitle}>Emergency help</Text>
          <Text style={styles.emergencyBody}>
            Immediate danger? See local call options now.
          </Text>
        </View>
        <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
      </Pressable>

      <InfoNotice
        title="Prototype, not a medical service"
        body="CareNow does not diagnose, connect you to clinicians, or contact emergency services automatically. For immediate danger, call your local emergency number."
        tone="warning"
        icon="info"
      />

      <View style={styles.section}>
        <SectionTitle title="What do you need?" />
        <ActionTile
          title="Check symptoms"
          body="A cautious safety check, not a diagnosis"
          icon="activity"
          onPress={() => router.push('/symptom-check')}
          testID="home-symptom-check"
        />
        <ActionTile
          title="Find nearby care"
          body="Search hospitals, clinics, and pharmacies"
          icon="map-pin"
          onPress={() => router.push('/directory')}
          testID="home-find-care"
          accent="warm"
        />
        <ActionTile
          title="Talk to a clinician"
          body="See consultation options and availability"
          icon="message-circle"
          onPress={() => router.push('/consultation')}
          testID="home-consultation"
        />
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileCardIcon}>
          <Feather name="heart" size={18} color={colors.primary} />
        </View>
        <View style={styles.profileCardCopy}>
          <Text style={[styles.profileTitle, { color: colors.foreground }]}>
            Your health details
          </Text>
          <Text style={[styles.profileBody, { color: colors.mutedForeground }]}>
            Keep a private, on-device demo profile ready to share when you choose.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View health details"
          testID="home-profile-link"
          onPress={() => router.push('/profile')}
          hitSlop={12}
        >
          <Feather name="chevron-right" size={21} color={colors.primary} />
        </Pressable>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCard: {
    minHeight: 94,
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCopy: { flex: 1, gap: 4 },
  emergencyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emergencyBody: { color: '#FFF2F0', fontSize: 13, lineHeight: 18 },
  section: { gap: 11 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },
  profileCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F3EE',
  },
  profileCardCopy: { flex: 1, gap: 4 },
  profileTitle: { fontSize: 14, fontWeight: '700' },
  profileBody: { fontSize: 12, lineHeight: 17 },
});
