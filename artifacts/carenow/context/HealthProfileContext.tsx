import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'carenow.profile.v1';

export type HealthProfile = {
  name: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  dependents: string[];
};

const emptyProfile: HealthProfile = {
  name: '',
  bloodType: '',
  allergies: [],
  conditions: [],
  medications: [],
  dependents: [],
};

type HealthProfileContextValue = {
  profile: HealthProfile;
  ready: boolean;
  storageError: string | null;
  saveProfile: (value: HealthProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const HealthProfileContext = createContext<HealthProfileContextValue | null>(
  null,
);

export function HealthProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<HealthProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'name' in parsed &&
            'allergies' in parsed &&
            Array.isArray(parsed.allergies)
          ) {
            const value = parsed as HealthProfile;
            setProfile({
              ...emptyProfile,
              ...value,
              allergies: value.allergies,
              conditions: Array.isArray(value.conditions)
                ? value.conditions
                : [],
              medications: Array.isArray(value.medications)
                ? value.medications
                : [],
              dependents: Array.isArray(value.dependents)
                ? value.dependents
                : [],
            });
          }
        }
      })
      .catch(() => {
        if (active) {
          setStorageError(
            'This device could not read the saved demo profile. You can still use emergency access and symptom screening.',
          );
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(async (value: HealthProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setProfile(value);
    setStorageError(null);
  }, []);

  const clearProfile = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(emptyProfile);
    setStorageError(null);
  }, []);

  const value = useMemo(
    () => ({ profile, ready, storageError, saveProfile, clearProfile }),
    [profile, ready, storageError, saveProfile, clearProfile],
  );

  return (
    <HealthProfileContext.Provider value={value}>
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile() {
  const value = useContext(HealthProfileContext);
  if (!value) {
    throw new Error(
      'useHealthProfile must be used inside HealthProfileProvider',
    );
  }
  return value;
}
