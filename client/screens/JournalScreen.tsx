import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { JournalEntry } from '../types';
import { journalService } from '../services/journalService';
import { useSelectedPersona } from '../hooks/usePersona';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { format } from 'date-fns';

export default function JournalScreen() {
  const { selectedPersona, selectedPersonaId } = useSelectedPersona();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await journalService.getAllEntries();
      setEntries(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setMood('');
    setModalVisible(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setMood('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please enter a title and content');
      return;
    }

    try {
      setSaving(true);
      if (editingEntry) {
        await journalService.updateEntry(editingEntry.id, {
          title,
          content,
          mood,
        });
      } else {
        await journalService.createEntry({
          title,
          content,
          mood,
          persona_id: selectedPersonaId || undefined,
          generate_reflection: false,
        });
      }
      closeModal();
      loadEntries();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: JournalEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteEntry(entry.id);
              loadEntries();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <Text style={styles.entryDate}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
      </View>

      {item.mood && (
        <Text style={styles.mood}>Mood: {item.mood}</Text>
      )}

      <Text style={styles.entryContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.ai_reflection && (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionLabel}>AI Reflection:</Text>
          <Text style={styles.reflectionText} numberOfLines={2}>
            {item.ai_reflection}
          </Text>
        </View>
      )}

      <View style={styles.entryActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading journal entries..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadEntries} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Journal Entries</Text>
            <Text style={styles.emptyText}>
              Start journaling your thoughts and reflections
            </Text>
          </View>
        }
      />

      <View style={styles.fab}>
        <Button
          title="New Entry"
          onPress={openCreateModal}
          size="large"
          fullWidth
        />
      </View>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Input
                label="Title *"
                value={title}
                onChangeText={setTitle}
                placeholder="Entry title"
                autoFocus
              />

              <Input
                label="Mood"
                value={mood}
                onChangeText={setMood}
                placeholder="How are you feeling?"
              />

              <Input
                label="Content *"
                value={content}
                onChangeText={setContent}
                placeholder="Write your thoughts..."
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={closeModal}
                  style={styles.modalButton}
                />
                <Button
                  title={editingEntry ? 'Update' : 'Save'}
                  onPress={handleSave}
                  loading={saving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  entryCard: {
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  entryDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  mood: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
    marginBottom: Spacing.sm,
  },
  entryContent: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  reflectionBox: {
    backgroundColor: Colors.backgroundLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  reflectionLabel: {
    ...Typography.caption,
    color: Colors.primaryLight,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  reflectionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  entryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});
