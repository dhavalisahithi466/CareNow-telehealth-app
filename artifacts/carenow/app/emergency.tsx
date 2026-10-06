import React from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  Heading,
  InfoNotice,
  Page,
  PrimaryButton,
} from '@/components/CareUI';
import { useColors } from '@/hooks/useColors';

const numbers = [
  { number: '112', region: 'India · Emergency response', icon: 'phone-call' as const },
  { number: '108', region: 'India · Ambulance', icon: 'activity' as const },
  { number: '911', region: 'United States · Emergency', icon: 'phone-call' as const },
];

async function openExternal(url: string, failure: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open', failure);
  }
}

export default function EmergencyScreen() {
  const colors = useColors();

  function callNumber(number: string) {
    Alert.alert(
      `Call ${number}?`,
      'This opens your phone app. CareNow will not place the call automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open phone',
          style: 'destructive',
          onPress: () => {
            void openExternal(`tel:${number}`, 'Use your phone app to call your local emergency number.');
          },
        },
      ],
    );
  }

  return (
    <Page>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.dangerSoft }]}>
          <Feather name="alert-triangle" size={23} color={colors.destructive} />
        </View>
        <Heading
          eyebrow="ACT NOW IF SOMEONE IS IN DANGER"
          title="Get emergency help."
          description="Call your local emergency service now for a life-threatening emergency. Do not wait for this app."
        />
      </View>

      <InfoNotice
        title="Choose the correct local number"
        body="Emergency numbers vary by country and service. Confirm the number for your current location before calling."
        tone="danger"
        icon="phone"
      />

      <View style={styles.numberList}>
        {numbers.map((item) => (
          <Pressable
            key={item.number}
            accessibilityRole="button"
            accessibilityLabel={`Call ${item.number}, ${item.region}`}
            testID={`emergency-call-${item.number}`}
            onPress={() => callNumber(item.number)}
            style={({ pressed }) => [
              styles.numberCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.83 : 1,
              },
            ]}
          >
            <View style={[styles.numberIcon, { backgroundColor: colors.dangerSoft }]}>
              <Feather name={item.icon} size={19} color={colors.destructive} />
            </View>
            <View style={styles.numberCopy}>
              <Text style={[styles.number, { color: colors.foreground }]}>{item.number}</Text>
              <Text style={[styles.region, { color: colors.mutedForeground }]}>{item.region}</Text>
            </View>
            <Feather name="arrow-up-right" size={19} color={colors.destructive} />
          </Pressable>
        ))}
      </View>

      <Card>
        <View style={styles.mapHeading}>
          <View style={[styles.mapIcon, { backgroundColor: colors.primarySoft }]}>
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={styles.mapCopy}>
            <Text style={[styles.mapTitle, { color: colors.foreground }]}>
              Find an emergency department
            </Text>
            <Text style={[styles.mapDescription, { color: colors.mutedForeground }]}>
              Opens a nearby search in your map app.
            </Text>
          </View>
        </View>
        <PrimaryButton
          title="Open nearby ER search"
          icon="map"
          variant="outline"
          testID="emergency-nearby-er"
          onPress={() =>
            void openExternal(
              Platform.OS === 'ios'
                ? 'maps://?q=Emergency%20Room'
                : 'https://www.google.com/maps/search/?api=1&query=emergency+room+near+me',
              'Open your map app and search for an emergency department near you.',
            )
          }
        />
      </Card>

      <InfoNotice
        title="This app does not contact dispatch"
        body="CareNow cannot locate you or share your location with emergency services. The call and map actions are opened only when you tap them."
        tone="neutral"
        icon="shield"
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 15 },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberList: { gap: 10 },
  numberCard: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 19,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numberCopy: { flex: 1, gap: 2 },
  number: { fontSize: 19, fontWeight: '700' },
  region: { fontSize: 12 },
  mapHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mapIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mapCopy: { flex: 1, gap: 3 },
  mapTitle: { fontSize: 14, fontWeight: '700' },
  mapDescription: { fontSize: 12, lineHeight: 17 },
});
