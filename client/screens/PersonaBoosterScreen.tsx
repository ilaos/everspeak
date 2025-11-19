import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { personaService } from '../services/personaService';
import { BoosterRecommendations } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RouteParams = {
  PersonaBooster: {
    personaId: string;
    personaName: string;
  };
};

export default function PersonaBoosterScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'PersonaBooster'>>();
  const { personaId, personaName } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<BoosterRecommendations | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personaService.getBoosterRecommendations(personaId);
      setRecommendations(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Analyzing persona..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadRecommendations} />;
  }

  if (!recommendations) {
    return <ErrorMessage message="No recommendations available" />;
  }

  const hasRecommendations =
    recommendations.missing_categories.length > 0 ||
    recommendations.new_memories.length > 0 ||
    Object.keys(recommendations.tone_suggestions).length > 0 ||
    recommendations.boundary_flags.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Persona Booster</Text>
          <Text style={styles.headerSubtitle}>Accuracy audit for {personaName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!hasRecommendations ? (
          <Card style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={styles.successTitle}>Looking Great!</Text>
            <Text style={styles.successText}>
              {personaName}'s persona is well-balanced with good coverage across memory categories.
            </Text>
          </Card>
        ) : (
          <>
            {/* Missing Categories */}
            {recommendations.missing_categories.length > 0 && (
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="alert-circle-outline" size={24} color={Colors.warning} />
                  <Text style={styles.sectionTitle}>Missing Memory Categories</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  These categories don't have any memories yet:
                </Text>
                <View style={styles.tagContainer}>
                  {recommendations.missing_categories.map((category) => (
                    <View key={category} style={styles.tag}>
                      <Text style={styles.tagText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Suggested New Memories */}
            {recommendations.new_memories.length > 0 && (
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Suggested Memories</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Based on existing patterns, consider adding:
                </Text>
                {recommendations.new_memories.map((memory, index) => (
                  <View key={index} style={styles.memoryCard}>
                    <View style={styles.memoryHeader}>
                      <View style={styles.memoryCategory}>
                        <Text style={styles.memoryCategoryText}>{memory.category}</Text>
                      </View>
                      <View style={styles.memoryWeight}>
                        <Ionicons name="star" size={14} color={Colors.warning} />
                        <Text style={styles.memoryWeightText}>{memory.weight.toFixed(1)}</Text>
                      </View>
                    </View>
                    <Text style={styles.memoryText}>{memory.text}</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Tone Suggestions */}
            {Object.keys(recommendations.tone_suggestions).length > 0 && (
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="options-outline" size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Tone Calibration</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Recommended tone adjustments:
                </Text>
                {Object.entries(recommendations.tone_suggestions).map(([key, value]) => (
                  <View key={key} style={styles.toneItem}>
                    <Text style={styles.toneLabel}>
                      {key.replace('_level', '').replace(/_/g, ' ')}:
                    </Text>
                    <Text style={styles.toneValue}>{value}</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Boundary Flags */}
            {recommendations.boundary_flags.length > 0 && (
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={Colors.info} />
                  <Text style={styles.sectionTitle}>Healthy Use Reminders</Text>
                </View>
                {recommendations.boundary_flags.map((flag, index) => (
                  <View key={index} style={styles.flagItem}>
                    <Ionicons name="information-circle" size={20} color={Colors.info} />
                    <Text style={styles.flagText}>{flag}</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        <View style={styles.actions}>
          <Button
            title="Close"
            variant="outline"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.success,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  memoryCard: {
    backgroundColor: Colors.backgroundLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  memoryCategory: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  memoryCategoryText: {
    ...Typography.caption,
    color: Colors.primaryLight,
  },
  memoryWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  memoryWeightText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  memoryText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  toneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toneLabel: {
    ...Typography.body,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  toneValue: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  flagText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  actions: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
