import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { useColors } from '@/hooks/useColors';

export default function CareScreen() {
  const colors = useColors();
  return (
    <Page>
      <Heading
        eyebrow="YOUR NEXT STEP"
        title="Find the right kind of care."
        description="Start with urgent safety, then choose what support you need."
      />
      <PressableEmergency />
      <View style={styles.section}>
        <SectionTitle title="Explore care" />
        <ActionTile
          title="Symptom safety check"
          body="Review urgent warning signs before anything else"
          icon="activity"
          onPress={() => router.push('/symptom-check')}
          testID="care-symptom-check"
        />
        <ActionTile
          title="Hospitals & emergency departments"
          body="Open a nearby search in your map app"
          icon="map"
          onPress={() => router.push({ pathname: '/directory', params: { category: 'hospital' } })}
          testID="care-hospitals"
          accent="danger"
        />
        <ActionTile
          title="Clinics & pharmacies"
          body="Search local services in your map app"
          icon="map-pin"
          onPress={() => router.push('/directory')}
          testID="care-directory"
          accent="warm"
        />
        <ActionTile
          title="Online consultation options"
          body="Text, audio, and video service status"
          icon="message-circle"
          onPress={() => router.push('/consultation')}
          testID="care-consultation"
        />
      </View>
      <Card style={styles.safetyCard}>
        <View style={styles.safetyIcon}>
          <Feather name="shield" size={18} color={colors.primary} />
        </View>
        <View style={styles.safetyCopy}>
          <Text style={[styles.safetyTitle, { color: colors.foreground }]}>
            Safety comes first
          </Text>
          <Text style={[styles.safetyBody, { color: colors.mutedForeground }]}>
            Severe or rapidly worsening symptoms need in-person emergency care. This prototype cannot assess your condition.
          </Text>
        </View>
      </Card>
      <InfoNotice
        title="No clinician network is connected"
        body="Consultation options explain the current prototype limit. No appointment request or medical message is sent."
        tone="neutral"
        icon="info"
      />
    </Page>
  );
}

function PressableEmergency() {
  return (
    <ActionTile
      title="Emergency help"
      body="Open local emergency call options"
      icon="phone-call"
      onPress={() => router.push('/emergency')}
      accent="danger"
      testID="care-emergency"
    />
  );
}

const styles = StyleSheet.create({
  section: { gap: 11 },
  safetyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  safetyIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F3EE',
  },
  safetyCopy: { flex: 1, gap: 5 },
  safetyTitle: { fontSize: 15, fontWeight: '700' },
  safetyBody: { fontSize: 13, lineHeight: 19 },
});
