import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { voiceService, VoiceOption, VoiceSettings as VoiceSettingsType } from '../services/voiceService';

/**
 * VoiceSettings Component
 *
 * User controls for voice chat:
 * - Enable/disable voice replies
 * - Select voice (curated options only)
 * - No voice cloning, no "sounds like" claims
 *
 * Changes apply immediately.
 * No confirmation pressure.
 * No guilt framing.
 */

interface VoiceSettingsProps {
  personaId: string;
  onClose?: () => void;
}

export default function VoiceSettings({ personaId, onClose }: VoiceSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<VoiceSettingsType | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    loadSettings();
  }, [personaId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await voiceService.getVoiceSettings(personaId);
      if (response.success) {
        setSettings(response.data.voice);
        setVoices(response.data.availableVoices);
      }
    } catch (err) {
      console.error('Failed to load voice settings:', err);
      Alert.alert('Error', 'Failed to load voice settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<VoiceSettingsType>) => {
    try {
      setSaving(true);
      const response = await voiceService.updateVoiceSettings(personaId, updates);
      if (response.success) {
        setSettings(response.data.voice);
      }
    } catch (err) {
      console.error('Failed to update voice settings:', err);
      Alert.alert('Error', 'Failed to update voice settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVoice = (enabled: boolean) => {
    updateSettings({ enabled });
  };

  const handleSelectVoice = (voiceId: string) => {
    updateSettings({ voice_id: voiceId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Settings</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Enable Voice Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Voice Replies</Text>
            <Text style={styles.toggleDescription}>
              When enabled, persona responses include audio
            </Text>
          </View>
          <Switch
            value={settings?.enabled || false}
            onValueChange={handleToggleVoice}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
            disabled={saving}
          />
        </View>
      </View>

      {/* Voice Selection */}
      {settings?.enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Voice</Text>
          <Text style={styles.sectionNote}>
            Choose a voice you're comfortable hearing. Voice does not affect persona behavior.
          </Text>

          <View style={styles.voiceList}>
            {voices.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceOption,
                  settings?.voice_id === voice.id && styles.voiceOptionSelected,
                ]}
                onPress={() => handleSelectVoice(voice.id)}
                disabled={saving}
              >
                <View style={styles.voiceInfo}>
                  <Text
                    style={[
                      styles.voiceName,
                      settings?.voice_id === voice.id && styles.voiceNameSelected,
                    ]}
                  >
                    {voice.name}
                  </Text>
                  <Text style={styles.voiceDescription}>{voice.description}</Text>
                </View>
                {settings?.voice_id === voice.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Info Note */}
      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
        <Text style={styles.infoText}>
          Audio is never auto-played. You can return to text-only at any time.
        </Text>
      </View>

      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  toggleDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  voiceList: {
    gap: Spacing.sm,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  voiceNameSelected: {
    color: Colors.primaryLight,
  },
  voiceDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  savingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
});
