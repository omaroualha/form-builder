import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Form, FormField } from '../types';
import { getCachedForm, saveSubmission } from '../db';
import { fetchPublicForm, submitPublicForm } from '../api';
import { cacheForm } from '../db';
import { useNetworkStatus } from '../useNetworkStatus';

type RootStackParamList = {
  Home: undefined;
  Form: { slug: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export function FormScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      // Try fetching fresh if online
      if (isOnline) {
        const freshForm = await fetchPublicForm(slug);
        await cacheForm(freshForm);
        setForm(freshForm);
        initFormData(freshForm);
      } else {
        // Fall back to cached version
        const cached = await getCachedForm(slug);
        if (cached) {
          setForm(cached);
          initFormData(cached);
        } else {
          Alert.alert('Offline', 'This form is not cached. Connect to the internet to load it.');
          navigation.goBack();
        }
      }
    } catch {
      // Try cache as fallback
      const cached = await getCachedForm(slug);
      if (cached) {
        setForm(cached);
        initFormData(cached);
      } else {
        Alert.alert('Error', 'Could not load form.');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const initFormData = (f: Form) => {
    const initial: Record<string, unknown> = {};
    f.fields.forEach((field) => {
      initial[field.name] = field.type === 'checkbox' ? false : '';
    });
    setFormData(initial);
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    // Basic required validation
    for (const field of form.fields) {
      if (field.required) {
        const val = formData[field.name];
        if (val === '' || val === undefined || val === null) {
          Alert.alert('Required', `"${field.label}" is required.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (isOnline) {
        // Online — submit directly, no need to save locally
        await submitPublicForm(slug, formData);
        Alert.alert('Submitted', 'Your response has been submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Offline — save locally for later sync
        await saveSubmission(slug, formData);
        Alert.alert('Saved Offline', 'Your response will be synced when you are back online.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      // Network failed — save locally as fallback
      await saveSubmission(slug, formData);
      Alert.alert('Saved Offline', 'Could not reach server. Your response will sync later.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextInput
            style={styles.textInput}
            placeholder={field.placeholder || field.label}
            value={(value as string) || ''}
            onChangeText={(v) => handleChange(field.name, v)}
            keyboardType={field.type === 'email' ? 'email-address' : 'default'}
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
          />
        );

      case 'number':
        return (
          <TextInput
            style={styles.textInput}
            placeholder={field.placeholder || field.label}
            value={(value as string) || ''}
            onChangeText={(v) => handleChange(field.name, v)}
            keyboardType="numeric"
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={field.placeholder || field.label}
            value={(value as string) || ''}
            onChangeText={(v) => handleChange(field.name, v)}
            multiline
            numberOfLines={4}
          />
        );

      case 'date':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={(value as string) || ''}
            onChangeText={(v) => handleChange(field.name, v)}
          />
        );

      case 'checkbox':
        return (
          <View style={styles.checkboxRow}>
            <Switch
              value={!!value}
              onValueChange={(v) => handleChange(field.name, v)}
              trackColor={{ true: '#2563eb' }}
            />
            <Text style={styles.checkboxLabel}>{value ? 'Yes' : 'No'}</Text>
          </View>
        );

      case 'select':
      case 'radio':
        return (
          <View style={styles.optionsContainer}>
            {field.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  value === option.value && styles.optionSelected,
                ]}
                onPress={() => handleChange(field.name, option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading form...</Text>
      </View>
    );
  }

  if (!form) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline — form will be saved locally</Text>
        </View>
      )}

      <Text style={styles.title}>{form.title}</Text>

      {form.fields.map((field) => (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          {renderField(field)}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 15,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});
