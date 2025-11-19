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
import { Memory, MemoryCategory } from '../types';
import { personaService } from '../services/personaService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSelectedPersona } from '../hooks/usePersona';

const MEMORY_CATEGORIES: { value: MemoryCategory; label: string; icon: string }[] = [
  { value: 'humor', label: 'Humor', icon: 'happy-outline' },
  { value: 'childhood', label: 'Childhood', icon: 'planet-outline' },
  { value: 'advice', label: 'Advice', icon: 'bulb-outline' },
  { value: 'personality', label: 'Personality', icon: 'person-outline' },
  { value: 'regrets', label: 'Regrets', icon: 'sad-outline' },
  { value: 'misc', label: 'Misc', icon: 'ellipsis-horizontal-outline' },
];

export default function MemoriesScreen() {
  const { selectedPersona, selectedPersonaId, loading: personaLoading } = useSelectedPersona();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('misc');
  const [weight, setWeight] = useState('1.0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedPersonaId) {
      loadMemories();
    }
  }, [selectedPersonaId]);

  const loadMemories = async () => {
    if (!selectedPersonaId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await personaService.getMemories(selectedPersonaId);
      setMemories(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMemory(null);
    setText('');
    setCategory('misc');
    setWeight('1.0');
    setModalVisible(true);
  };

  const openEditModal = (memory: Memory) => {
    setEditingMemory(memory);
    setText(memory.text);
    setCategory(memory.category);
    setWeight(memory.weight.toString());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMemory(null);
    setText('');
    setCategory('misc');
    setWeight('1.0');
  };

  const handleSave = async () => {
    if (!selectedPersonaId) return;
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter memory text');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 0.1 || weightNum > 5.0) {
      Alert.alert('Error', 'Weight must be between 0.1 and 5.0');
      return;
    }

    try {
      setSaving(true);
      if (editingMemory) {
        await personaService.updateMemory(selectedPersonaId, editingMemory.id, {
          text,
          category,
          weight: weightNum,
        });
      } else {
        await personaService.createMemory(selectedPersonaId, {
          text,
          category,
          weight: weightNum,
        });
      }
      closeModal();
      loadMemories();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save memory');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (memory: Memory) => {
    if (!selectedPersonaId) return;

    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await personaService.deleteMemory(selectedPersonaId, memory.id);
              loadMemories();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete memory');
            }
          },
        },
      ]
    );
  };

  const getCategoryInfo = (cat: MemoryCategory) => {
    return MEMORY_CATEGORIES.find((c) => c.value === cat) || MEMORY_CATEGORIES[5];
  };

  const renderMemoryCard = ({ item }: { item: Memory }) => {
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <Card style={styles.memoryCard}>
        <View style={styles.memoryHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryInfo.icon as any} size={16} color={Colors.primaryLight} />
            <Text style={styles.categoryText}>{categoryInfo.label}</Text>
          </View>
          <View style={styles.weightBadge}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.weightText}>{item.weight.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.memoryText}>{item.text}</Text>

        <View style={styles.memoryActions}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (personaLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!selectedPersona) {
    return (
      <View style={styles.noPersonaContainer}>
        <Ionicons name="person-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.noPersonaTitle}>No Persona Selected</Text>
        <Text style={styles.noPersonaText}>
          Please select or create a persona first
        </Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading memories..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMemories} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedPersona.name}'s Memories</Text>
        <Text style={styles.headerSubtitle}>
          {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
        </Text>
      </View>

      <FlatList
        data={memories}
        renderItem={renderMemoryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Memories Yet</Text>
            <Text style={styles.emptyText}>
              Add memories to build {selectedPersona.name}'s personality
            </Text>
          </View>
        }
      />

      <View style={styles.fab}>
        <Button
          title="Add Memory"
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
                  {editingMemory ? 'Edit Memory' : 'Add Memory'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Input
                label="Memory *"
                value={text}
                onChangeText={setText}
                placeholder="Describe the memory..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {MEMORY_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryChip,
                        category === cat.value && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={category === cat.value ? Colors.primary : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          category === cat.value && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Importance Weight (0.1 - 5.0)"
                value={weight}
                onChangeText={setWeight}
                placeholder="1.0"
                keyboardType="decimal-pad"
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={closeModal}
                  style={styles.modalButton}
                />
                <Button
                  title={editingMemory ? 'Update' : 'Add'}
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
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  memoryCard: {
    marginBottom: Spacing.md,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.primaryLight,
    marginLeft: Spacing.xs,
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: Spacing.xs,
  },
  memoryText: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  memoryActions: {
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
  noPersonaContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  noPersonaTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  noPersonaText: {
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
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    margin: Spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: Colors.backgroundLight,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  categoryChipTextSelected: {
    color: Colors.primary,
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
