import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchPublicForm } from '../api';
import { cacheForm, getCachedForms, getPendingCount } from '../db';
import { syncPendingSubmissions } from '../sync';
import { useNetworkStatus } from '../useNetworkStatus';

type RootStackParamList = {
  Home: undefined;
  Form: { slug: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [cachedForms, setCachedForms] = useState<{ slug: string; title: string; fetched_at: string }[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useNetworkStatus();

  const refreshCounts = useCallback(() => {
    getCachedForms().then(setCachedForms);
    getPendingCount().then(setPendingCount);
  }, []);

  // Refresh on screen focus
  useFocusEffect(refreshCounts);

  // Sync when going back online
  useEffect(() => {
    if (isOnline) {
      setSyncing(true);
      syncPendingSubmissions()
        .then(() => refreshCounts())
        .finally(() => setSyncing(false));
    }
  }, [isOnline, refreshCounts]);

  const handleLoadForm = async () => {
    const trimmed = slug.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      if (isOnline) {
        const form = await fetchPublicForm(trimmed);
        await cacheForm(form);
      }
      navigation.navigate('Form', { slug: trimmed });
    } catch {
      Alert.alert('Error', 'Could not load form. Check the slug and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline — cached forms still available</Text>
        </View>
      )}

      <Text style={styles.title}>Form Builder</Text>
      <Text style={styles.subtitle}>Enter a form slug to get started</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. contact-form"
          value={slug}
          onChangeText={setSlug}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLoadForm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Load</Text>
          )}
        </TouchableOpacity>
      </View>

      {(pendingCount > 0 || syncing) && (
        <View style={styles.pendingBadge}>
          {syncing ? (
            <View style={styles.syncingRow}>
              <ActivityIndicator size="small" color="#92400e" />
              <Text style={styles.pendingText}>Syncing submissions...</Text>
            </View>
          ) : (
            <Text style={styles.pendingText}>
              {pendingCount} pending submission{pendingCount > 1 ? 's' : ''} — will sync when online
            </Text>
          )}
        </View>
      )}

      {cachedForms.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Cached Forms</Text>
          <FlatList
            data={cachedForms}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cachedItem}
                onPress={() => navigation.navigate('Form', { slug: item.slug })}
              >
                <Text style={styles.cachedTitle}>{item.title}</Text>
                <Text style={styles.cachedSlug}>{item.slug}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  offlineBanner: {
    backgroundColor: '#fbbf24',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: '#78350f',
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  pendingText: {
    color: '#92400e',
    fontSize: 13,
  },
  syncingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 12,
  },
  cachedItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cachedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cachedSlug: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
