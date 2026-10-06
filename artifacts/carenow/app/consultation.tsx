import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Card,
  Heading,
  InfoNotice,
  Page,
  PrimaryButton,
} from '@/components/CareUI';
import { useColors } from '@/hooks/useColors';

const modes = [
  { label: 'Text', detail: 'Secure messaging', icon: 'message-square' as const },
  { label: 'Audio', detail: 'Voice consultation', icon: 'phone' as const },
  { label: 'Video', detail: 'Video consultation', icon: 'video' as const },
];

export default function ConsultationScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ mode?: string }>();
  return (
    <Page>
      <Heading
        eyebrow="ONLINE CARE"
        title="Choose how you would like to connect."
        description={params.mode ? `${params.mode} consultation selected` : 'Text, audio, and video consultation options.'}
      />
      <InfoNotice
        title="Clinician connections are not live"
        body="This prototype has no verified provider network. It cannot create an appointment, send a message, or start a call."
        tone="warning"
        icon="info"
      />
      <View style={styles.modeList}>
        {modes.map((mode) => (
          <Card key={mode.label} style={styles.modeCard}>
            <View style={[styles.modeIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name={mode.icon} size={19} color={colors.primary} />
            </View>
            <View style={styles.modeCopy}>
              <Text style={[styles.modeTitle, { color: colors.foreground }]}>{mode.label}</Text>
              <Text style={[styles.modeDetail, { color: colors.mutedForeground }]}>{mode.detail}</Text>
            </View>
            <Text style={[styles.unavailable, { color: colors.warning }]}>Unavailable</Text>
          </Card>
        ))}
      </View>
      <Card style={styles.boundaryCard}>
        <Text style={[styles.boundaryTitle, { color: colors.foreground }]}>When you need care now</Text>
        <Text style={[styles.boundaryBody, { color: colors.mutedForeground }]}>
          For severe, sudden, or worsening symptoms, call your local emergency number or go to an emergency department. Do not wait for online care.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton
            title="Emergency call options"
            icon="phone-call"
            variant="danger"
            testID="consult-emergency"
            onPress={() => router.push('/emergency')}
          />
          <PrimaryButton
            title="Find local care"
            icon="map-pin"
            variant="outline"
            testID="consult-directory"
            onPress={() => router.push('/directory')}
          />
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  modeList: { gap: 10 },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  modeCopy: { flex: 1, gap: 3 },
  modeTitle: { fontSize: 15, fontWeight: '700' },
  modeDetail: { fontSize: 12 },
  unavailable: { fontSize: 11, fontWeight: '700' },
  boundaryCard: { gap: 10 },
  boundaryTitle: { fontSize: 16, fontWeight: '700' },
  boundaryBody: { fontSize: 13, lineHeight: 20 },
  actions: { gap: 9, marginTop: 2 },
});
