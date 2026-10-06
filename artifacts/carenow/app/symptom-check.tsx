import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Card,
  Heading,
  InfoNotice,
  Page,
  PrimaryButton,
} from '@/components/CareUI';
import { useColors } from '@/hooks/useColors';

const redFlags = [
  { id: 'chest', label: 'Severe or crushing chest pain' },
  { id: 'breathing', label: 'Severe trouble breathing' },
  { id: 'stroke', label: 'Sudden one-sided weakness, facial droop, or trouble speaking' },
  { id: 'allergy', label: 'Severe allergic reaction, swelling, or collapse' },
  { id: 'unresponsive', label: 'Unconscious, hard to wake, or having a seizure' },
  { id: 'bleeding', label: 'Uncontrolled bleeding, major injury, or serious head trauma' },
];

const otherSymptoms = [
  { id: 'fever', label: 'Fever or chills' },
  { id: 'pain', label: 'Pain or discomfort' },
  { id: 'stomach', label: 'Nausea or stomach symptoms' },
  { id: 'other', label: 'Something else' },
];

export default function SymptomCheckScreen() {
  const colors = useColors();
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<'urgent' | 'non-urgent' | null>(null);
  const highRisk = selected.some((id) => redFlags.some((flag) => flag.id === id));
  const anySelected = selected.length > 0;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current.filter((item) => item !== 'none'), id],
    );
    setResult(null);
  }

  function check() {
    if (!anySelected) return;
    setResult(highRisk ? 'urgent' : 'non-urgent');
  }

  return (
    <Page>
      <Heading
        eyebrow="SAFETY CHECK"
        title="What is happening right now?"
        description="Select anything that applies. This is a basic warning-sign check, not a medical assessment."
      />
      <InfoNotice
        title="If this feels like an emergency, stop here"
        body="Call your local emergency service immediately for severe, sudden, or rapidly worsening symptoms. Do not wait for a screening result."
        tone="danger"
        icon="alert-triangle"
      />

      <Card style={styles.questionCard}>
        <Text style={[styles.groupTitle, { color: colors.foreground }]}>
          Emergency warning signs
        </Text>
        <Text style={[styles.groupHint, { color: colors.mutedForeground }]}>
          Tap all that apply, or choose “None of these”.
        </Text>
        {redFlags.map((item) => (
          <SymptomOption
            key={item.id}
            id={item.id}
            label={item.label}
            selected={selected.includes(item.id)}
            urgent
            onPress={toggle}
          />
        ))}
        <SymptomOption
          id="none"
          label="None of these warning signs"
          selected={selected.includes('none')}
          onPress={() => {
            setSelected((current) =>
              current.includes('none') ? current.filter((id) => id !== 'none') : ['none'],
            );
            setResult(null);
          }}
        />
      </Card>

      <Card style={styles.questionCard}>
        <Text style={[styles.groupTitle, { color: colors.foreground }]}>
          Other symptoms
        </Text>
        {otherSymptoms.map((item) => (
          <SymptomOption
            key={item.id}
            id={item.id}
            label={item.label}
            selected={selected.includes(item.id)}
            onPress={toggle}
          />
        ))}
      </Card>

      {result === 'urgent' ? (
        <View style={styles.resultStack}>
          <InfoNotice
            title="Seek emergency help now"
            body="One or more warning signs were selected. This app cannot assess how serious they are. Call your local emergency number or go to an emergency department now. Do not book an online consultation."
            tone="danger"
            icon="alert-circle"
          />
          <PrimaryButton
            title="Open emergency call options"
            icon="phone-call"
            variant="danger"
            onPress={() => router.push('/emergency')}
            testID="triage-emergency"
          />
        </View>
      ) : result === 'non-urgent' ? (
        <View style={styles.resultStack}>
          <InfoNotice
            title="No listed warning sign selected"
            body="This does not rule out an emergency or tell you what is causing symptoms. If you are concerned or getting worse, seek urgent in-person care."
            tone="neutral"
            icon="info"
          />
          <PrimaryButton
            title="See consultation options"
            icon="message-circle"
            onPress={() => router.push('/consultation')}
            testID="triage-consult-options"
          />
        </View>
      ) : null}

      {result === null ? (
        <PrimaryButton
          title="Continue safety check"
          icon="arrow-right"
          disabled={!anySelected}
          onPress={check}
          testID="triage-submit"
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          testID="triage-reset"
          onPress={() => {
            setSelected([]);
            setResult(null);
          }}
          style={styles.reset}
        >
          <Text style={[styles.resetText, { color: colors.primary }]}>
            Start a new check
          </Text>
          <Feather name="refresh-cw" size={15} color={colors.primary} />
        </Pressable>
      )}

      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        This screening uses a short list of warning signs. It is not validated clinical triage and may miss emergencies.
      </Text>
    </Page>
  );
}

function SymptomOption({
  id,
  label,
  selected,
  urgent = false,
  onPress,
}: {
  id: string;
  label: string;
  selected: boolean;
  urgent?: boolean;
  onPress: (id: string) => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      testID={`symptom-${id}`}
      onPress={() => onPress(id)}
      style={({ pressed }) => [
        styles.option,
        {
          borderColor: selected
            ? urgent
              ? colors.destructive
              : colors.primary
            : colors.border,
          backgroundColor: selected
            ? urgent
              ? colors.dangerSoft
              : colors.primarySoft
            : colors.card,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: selected
              ? urgent
                ? colors.destructive
                : colors.primary
              : 'transparent',
            borderColor: selected
              ? urgent
                ? colors.destructive
                : colors.primary
              : colors.border,
          },
        ]}
      >
        {selected ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
      </View>
      <Text style={[styles.optionText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  questionCard: { gap: 10 },
  groupTitle: { fontSize: 16, fontWeight: '700' },
  groupHint: { fontSize: 12, lineHeight: 17, marginTop: -5 },
  option: {
    minHeight: 51,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    height: 21,
    width: 21,
    borderWidth: 1.5,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  resultStack: { gap: 11 },
  reset: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { fontSize: 14, fontWeight: '700' },
  disclaimer: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
