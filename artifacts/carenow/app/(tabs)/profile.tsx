import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  Heading,
  InfoNotice,
  Page,
  PrimaryButton,
  SectionTitle,
} from '@/components/CareUI';
import {
  useHealthProfile,
  type HealthProfile,
} from '@/context/HealthProfileContext';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const { profile, ready, storageError, saveProfile, clearProfile } =
    useHealthProfile();
  if (!ready) {
    return (
      <Page>
        <Heading title="Health profile" description="Loading this device's demo profile…" />
      </Page>
    );
  }

  return (
    <Page>
      <Heading
        eyebrow="ON THIS DEVICE"
        title="Health profile"
        description="A simple summary you control. Nothing is sent to a clinician or server."
      />
      <InfoNotice
        title="Demo data only"
        body="This prototype stores details in local app storage, which is not encrypted. Do not enter real medical or identifying information."
        tone="warning"
        icon="lock"
      />
      {storageError ? (
        <InfoNotice title="Local storage notice" body={storageError} tone="danger" icon="alert-circle" />
      ) : null}
      <ProfileEditor
        key={JSON.stringify(profile)}
        profile={profile}
        onSave={saveProfile}
      />
      <View style={styles.exportSection}>
        <SectionTitle title="Share a summary" />
        <Card>
          <Text style={[styles.exportBody, { color: colors.mutedForeground }]}>
            Create a plain-text summary for you to review and share using your device's share sheet. This is not a certified EHR export.
          </Text>
          <PrimaryButton
            title="Review & share summary"
            icon="share"
            variant="outline"
            testID="profile-export"
            onPress={() => {
              const summary = formatProfile(profile);
              Alert.alert(
                'Health information',
                'This summary contains health details. Only share it with someone you trust.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Open share options',
                    onPress: () => {
                      Share.share({
                        title: 'CareNow health summary',
                        message: summary,
                      }).catch(() =>
                        Alert.alert(
                          'Could not open sharing',
                          'Your profile is unchanged. Try again from this device.',
                        ),
                      );
                    },
                  },
                ],
              );
            }}
          />
        </Card>
      </View>
      {hasProfile(profile) ? (
        <PrimaryButton
          title="Delete saved demo profile"
          icon="trash-2"
          variant="outline"
          testID="profile-clear"
          onPress={() => {
            Alert.alert(
              'Delete profile?',
              'This removes the saved CareNow demo profile from this device.',
              [
                { text: 'Keep profile', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    clearProfile().catch(() =>
                      Alert.alert('Could not delete', 'Please try again.'),
                    );
                  },
                },
              ],
            );
          }}
        />
      ) : null}
    </Page>
  );
}

function ProfileEditor({
  profile,
  onSave,
}: {
  profile: HealthProfile;
  onSave: (value: HealthProfile) => Promise<void>;
}) {
  const colors = useColors();
  const [name, setName] = useState(profile.name);
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [allergies, setAllergies] = useState(profile.allergies);
  const [conditions, setConditions] = useState(profile.conditions);
  const [medications, setMedications] = useState(profile.medications);
  const [dependents, setDependents] = useState(profile.dependents);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const draft: HealthProfile = {
    name: name.trim(),
    bloodType: bloodType.trim(),
    allergies,
    conditions,
    medications,
    dependents,
  };

  async function save() {
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
      Alert.alert('Saved on this device', 'Your demo profile has been updated.');
    } catch {
      setError('Could not save on this device. Check available storage and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <SectionTitle title="Basic details" />
      <InputField label="Preferred name" value={name} onChangeText={setName} placeholder="Name" />
      <InputField label="Blood type (optional)" value={bloodType} onChangeText={setBloodType} placeholder="For example, O+" />
      <ListEditor
        title="Allergies"
        items={allergies}
        onChange={setAllergies}
        placeholder="Add an allergy"
        testID="profile-allergy"
      />
      <ListEditor
        title="Ongoing conditions"
        items={conditions}
        onChange={setConditions}
        placeholder="Add a condition"
        testID="profile-condition"
      />
      <ListEditor
        title="Medications"
        items={medications}
        onChange={setMedications}
        placeholder="Add a medication"
        testID="profile-medication"
      />
      <ListEditor
        title="People you care for"
        items={dependents}
        onChange={setDependents}
        placeholder="Add a dependent's preferred name"
        testID="profile-dependent"
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acknowledged }}
        testID="profile-acknowledgement"
        onPress={() => setAcknowledged((current) => !current)}
        style={styles.acknowledge}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: acknowledged ? colors.primary : 'transparent',
              borderColor: acknowledged ? colors.primary : colors.border,
            },
          ]}
        >
          {acknowledged ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}
        </View>
        <Text style={[styles.acknowledgeText, { color: colors.foreground }]}>
          I understand this is unencrypted demo storage and will not enter real medical information.
        </Text>
      </Pressable>
      {error ? <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
      <PrimaryButton
        title="Save profile on this device"
        icon="save"
        onPress={save}
        disabled={!acknowledged}
        loading={saving}
        testID="profile-save"
      />
    </Card>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.input },
        ]}
        accessibilityLabel={label}
        autoCapitalize="words"
      />
    </View>
  );
}

function ListEditor({
  title,
  items,
  onChange,
  placeholder,
  testID,
}: {
  title: string;
  items: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  testID: string;
}) {
  const colors = useColors();
  const [value, setValue] = useState('');
  function add() {
    const clean = value.trim();
    if (!clean || items.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    onChange([...items, clean]);
    setValue('');
  }
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{title}</Text>
      <View style={styles.addRow}>
        <TextInput
          testID={`${testID}-input`}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            styles.flexInput,
            { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.input },
          ]}
          accessibilityLabel={placeholder}
          returnKeyType="done"
          onSubmitEditing={add}
        />
        <Pressable
          testID={`${testID}-add`}
          accessibilityRole="button"
          accessibilityLabel={`Add ${title.toLowerCase()}`}
          onPress={add}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primarySoft, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Feather name="plus" size={19} color={colors.primary} />
        </Pressable>
      </View>
      {items.length ? (
        <View style={styles.chipList}>
          {items.map((item) => (
            <View
              key={item}
              style={[styles.chip, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.chipText, { color: colors.secondaryForeground }]}>{item}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item}`}
                testID={`${testID}-remove-${item}`}
                hitSlop={8}
                onPress={() => onChange(items.filter((entry) => entry !== item))}
              >
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyList, { color: colors.mutedForeground }]}>Nothing added</Text>
      )}
    </View>
  );
}

function formatProfile(profile: HealthProfile) {
  const section = (title: string, items: string[]) =>
    `${title}: ${items.length ? items.join(', ') : 'None listed'}`;
  return [
    'CareNow health summary (user-entered demo information)',
    `Name: ${profile.name || 'Not provided'}`,
    `Blood type: ${profile.bloodType || 'Not provided'}`,
    section('Allergies', profile.allergies),
    section('Ongoing conditions', profile.conditions),
    section('Medications', profile.medications),
    section('Dependents', profile.dependents),
    '',
    'This is not a medical record or certified EHR export. Verify all information with a licensed clinician.',
  ].join('\n');
}

function hasProfile(profile: HealthProfile) {
  return Boolean(
    profile.name ||
      profile.bloodType ||
      profile.allergies.length ||
      profile.conditions.length ||
      profile.medications.length ||
      profile.dependents.length,
  );
}

const styles = StyleSheet.create({
  exportSection: { gap: 11 },
  exportBody: { fontSize: 13, lineHeight: 20 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700' },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    fontSize: 15,
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  flexInput: { flex: 1 },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 34,
    borderRadius: 12,
    paddingLeft: 10,
    paddingRight: 7,
    maxWidth: '100%',
  },
  chipText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  emptyList: { fontSize: 12 },
  acknowledge: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 2 },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  errorText: { fontSize: 13, lineHeight: 19 },
});
