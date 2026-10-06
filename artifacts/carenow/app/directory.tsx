import React from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import {
  Card,
  Heading,
  InfoNotice,
  Page,
  PrimaryButton,
} from '@/components/CareUI';
import { useColors } from '@/hooks/useColors';

const places = [
  { id: 'hospital', title: 'Emergency departments', query: 'emergency department', icon: 'plus-square' as const, urgent: true },
  { id: 'hospital', title: 'Hospitals', query: 'hospital', icon: 'activity' as const },
  { id: 'clinic', title: 'Clinics', query: 'clinic', icon: 'home' as const },
  { id: 'pharmacy', title: '24-hour pharmacies', query: '24 hour pharmacy', icon: 'thermometer' as const },
];

export default function DirectoryScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory = params.category;
  return (
    <Page>
      <Heading
        eyebrow="LOCAL SERVICES"
        title="Find care around you."
        description="Choose a service to search in your map app. Results depend on your location and the map provider."
      />
      <InfoNotice
        title="Check before you travel"
        body="CareNow does not verify listings, opening hours, emergency capability, or availability. For urgent symptoms, use emergency services."
        tone="warning"
        icon="map-pin"
      />
      <View style={styles.list}>
        {places.map((place, index) => {
          const suggested = initialCategory === 'hospital' && index === 0;
          return (
            <Card key={`${place.title}-${index}`} style={styles.placeCard}>
              <View style={[styles.placeIcon, { backgroundColor: place.urgent ? colors.dangerSoft : colors.primarySoft }]}>
                <Feather name={place.icon} size={19} color={place.urgent ? colors.destructive : colors.primary} />
              </View>
              <View style={styles.placeCopy}>
                <Text style={[styles.placeTitle, { color: colors.foreground }]}>{place.title}</Text>
                <Text style={[styles.placeBody, { color: colors.mutedForeground }]}>
                  {suggested ? 'Suggested for emergencies' : `Search for ${place.query} nearby`}
                </Text>
              </View>
              <PrimaryButton
                title="Search"
                icon="arrow-up-right"
                variant={place.urgent ? 'danger' : 'outline'}
                testID={`directory-${place.query.replaceAll(' ', '-')}`}
                onPress={() => {
                  const url =
                    Platform.OS === 'ios'
                      ? `maps://?q=${encodeURIComponent(place.query)}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.query} near me`)}`;
                  Linking.openURL(url).catch(() =>
                    Alert.alert(
                      'Unable to open map search',
                      `Open your map app and search for ${place.query}.`,
                    ),
                  );
                }}
              />
            </Card>
          );
        })}
      </View>
      <Card style={styles.locationCard}>
        <View style={[styles.locationIcon, { backgroundColor: colors.accent }]}>
          <Feather name="navigation" size={17} color={colors.warning} />
        </View>
        <View style={styles.locationCopy}>
          <Text style={[styles.locationTitle, { color: colors.foreground }]}>Your location stays with your map app</Text>
          <Text style={[styles.locationBody, { color: colors.mutedForeground }]}>
            CareNow does not collect or send your location. The external map app may use its own location settings.
          </Text>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  list: { gap: 11 },
  placeCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 11 },
  placeIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  placeCopy: { flex: 1, minWidth: 145, gap: 3 },
  placeTitle: { fontSize: 14, fontWeight: '700' },
  placeBody: { fontSize: 12, lineHeight: 17 },
  locationCard: { flexDirection: 'row', gap: 11 },
  locationIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 4 },
  locationTitle: { fontSize: 13, fontWeight: '700' },
  locationBody: { fontSize: 12, lineHeight: 18 },
});
