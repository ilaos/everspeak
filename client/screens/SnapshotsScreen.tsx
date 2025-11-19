import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { personaService } from '../services/personaService';
import { Snapshot } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';

type RouteParams = {
  Snapshots: {
    personaId: string;
    personaName: string;
  };
};

export default function SnapshotsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Snapshots'>>();
  const { personaId, personaName } = route.params;

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personaService.getSnapshots(personaId);
      setSnapshots(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) {
      Alert.alert('Error', 'Please enter a snapshot name');
      return;
    }

    try {
      setSaving(true);
      await personaService.createSnapshot(personaId, { name: snapshotName });
      setModalVisible(false);
      setSnapshotName('');
      loadSnapshots();
      Alert.alert('Success', 'Snapshot created successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create snapshot');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    Alert.alert(
      'Restore Snapshot',
      `Are you sure you want to restore "${snapshot.name}"? This will replace the current persona state.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await personaService.restoreSnapshot(personaId, snapshot.id);
              Alert.alert(
                'Success',
                'Snapshot restored successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                      (navigation as any).navigate('Memories');
                    },
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to restore snapshot');
            }
          },
        },
      ]
    );
  };

  const renderSnapshot = ({ item }: { item: Snapshot }) => (
    <Card style={styles.snapshotCard}>
      <View style={styles.snapshotHeader}>
        <Ionicons name="camera-outline" size={24} color={Colors.primary} />
        <View style={styles.snapshotInfo}>
          <Text style={styles.snapshotName}>{item.name}</Text>
          <Text style={styles.snapshotDate}>
            {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      </View>

      <View style={styles.snapshotStats}>
        <View style={styles.stat}>
          <Ionicons name="images-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>
            {item.memories.length} {item.memories.length === 1 ? 'memory' : 'memories'}
          </Text>
        </View>
      </View>

      <View style={styles.snapshotActions}>
        <Button
          title="Restore"
          variant="primary"
          size="small"
          onPress={() => handleRestoreSnapshot(item)}
          style={styles.restoreButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading snapshots..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadSnapshots} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Snapshots</Text>
          <Text style={styles.headerSubtitle}>Version control for {personaName}</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          Snapshots save the current state of memories and settings. You can restore to any previous snapshot.
        </Text>
      </Card>

      <FlatList
        data={snapshots}
        renderItem={renderSnapshot}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Snapshots Yet</Text>
            <Text style={styles.emptyText}>
              Create a snapshot to save the current state
            </Text>
          </View>
        }
      />

      <View style={styles.fab}>
        <Button
          title="Create Snapshot"
          onPress={() => setModalVisible(true)}
          size="large"
          fullWidth
        />
      </View>

      {/* Create Snapshot Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Snapshot</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Snapshot Name *"
              value={snapshotName}
              onChangeText={setSnapshotName}
              placeholder="e.g., Before wizard changes"
              autoFocus
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleCreateSnapshot}
                loading={saving}
                style={styles.modalButton}
              />
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  snapshotCard: {
    marginBottom: Spacing.md,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  snapshotInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  snapshotName: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  snapshotDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  snapshotStats: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  snapshotActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  restoreButton: {
    alignSelf: 'flex-start',
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
    padding: Spacing.lg,
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
