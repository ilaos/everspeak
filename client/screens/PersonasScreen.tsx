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
import { Persona } from '../types';
import { personaService } from '../services/personaService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSelectedPersona } from '../hooks/usePersona';
import { useNavigation } from '@react-navigation/native';

export default function PersonasScreen() {
  const navigation = useNavigation();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const { selectedPersonaId, selectPersona } = useSelectedPersona();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personaService.getAllPersonas();
      setPersonas(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPersona(null);
    setName('');
    setRelationship('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (persona: Persona) => {
    setEditingPersona(persona);
    setName(persona.name);
    setRelationship(persona.relationship || '');
    setDescription(persona.description || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPersona(null);
    setName('');
    setRelationship('');
    setDescription('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      setSaving(true);
      if (editingPersona) {
        await personaService.updatePersona(editingPersona.id, {
          name,
          relationship,
          description,
        });
      } else {
        const response = await personaService.createPersona({
          name,
          relationship,
          description,
        });
        // Auto-select the first persona created
        if (personas.length === 0) {
          selectPersona(response.data.id);
        }
      }
      closeModal();
      loadPersonas();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save persona');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (persona: Persona) => {
    Alert.alert(
      'Delete Persona',
      `Are you sure you want to delete "${persona.name}"? This will also delete all associated memories.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await personaService.deletePersona(persona.id);
              if (selectedPersonaId === persona.id) {
                selectPersona(null);
              }
              loadPersonas();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete persona');
            }
          },
        },
      ]
    );
  };

  const renderPersonaCard = ({ item }: { item: Persona }) => {
    const isSelected = item.id === selectedPersonaId;

    return (
      <Card style={[styles.personaCard, isSelected && styles.selectedCard]}>
        <TouchableOpacity
          onPress={() => selectPersona(item.id)}
          style={styles.cardContent}
        >
          <View style={styles.personaIcon}>
            <Ionicons
              name="person-circle"
              size={48}
              color={isSelected ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>

          <View style={styles.personaInfo}>
            <Text style={styles.personaName}>{item.name}</Text>
            {item.relationship && (
              <Text style={styles.personaRelationship}>{item.relationship}</Text>
            )}
            {item.description && (
              <Text style={styles.personaDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Onboarding', {
                personaId: item.id,
                personaName: item.name,
              })}
              style={styles.actionButton}
            >
              <Ionicons name="mic-outline" size={18} color={Colors.success} />
              <Text style={[styles.actionText, { color: Colors.success }]}>Onboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Snapshots', {
                personaId: item.id,
                personaName: item.name,
              })}
              style={styles.actionButton}
            >
              <Ionicons name="camera-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Snapshots</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading personas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadPersonas} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={personas}
        renderItem={renderPersonaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Personas Yet</Text>
            <Text style={styles.emptyText}>
              Create a persona to start honoring your loved ones
            </Text>
          </View>
        }
      />

      <View style={styles.fab}>
        <Button
          title="Create Persona"
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
                  {editingPersona ? 'Edit Persona' : 'Create Persona'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Input
                label="Name *"
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                autoFocus
              />

              <Input
                label="Relationship"
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g., Mother, Brother, Friend"
              />

              <Input
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description..."
                multiline
                numberOfLines={4}
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
                  title={editingPersona ? 'Update' : 'Create'}
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
  personaCard: {
    marginBottom: Spacing.md,
  },
  selectedCard: {
    borderColor: Colors.primaryLight,
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  personaIcon: {
    marginRight: Spacing.md,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  personaRelationship: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
    marginBottom: Spacing.xs,
  },
  personaDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  selectedBadge: {
    marginLeft: Spacing.sm,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
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
