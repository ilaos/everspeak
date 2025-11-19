import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { personaService } from '../services/personaService';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RouteParams = {
  BulkImport: {
    personaId: string;
    personaName: string;
  };
};

export default function BulkImportScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BulkImport'>>();
  const { personaId, personaName } = route.params;

  const [text, setText] = useState('');
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text to import');
      return;
    }

    try {
      setImporting(true);
      const response = await personaService.bulkImportMemories(personaId, {
        text,
        auto_categorize: autoCategorize,
      });

      Alert.alert(
        'Success!',
        `Successfully imported ${response.data.length} memories for ${personaName}`,
        [
          {
            text: 'View Memories',
            onPress: () => {
              navigation.goBack();
              (navigation as any).navigate('Memories');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to import memories');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bulk Memory Import</Text>
          <Text style={styles.headerSubtitle}>Importing for {personaName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Paste large blocks of text like letters, stories, or notes. AI will automatically split them into individual memories and categorize them.
            </Text>
          </View>
        </Card>

        <Input
          label="Text to Import *"
          value={text}
          onChangeText={setText}
          placeholder="Paste letters, stories, journal entries, or any text about your loved one..."
          multiline
          numberOfLines={12}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAutoCategorize(!autoCategorize)}
        >
          <Ionicons
            name={autoCategorize ? 'checkbox' : 'square-outline'}
            size={24}
            color={autoCategorize ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>Auto-categorize with AI</Text>
            <Text style={styles.checkboxDescription}>
              Automatically assign categories and weights to each memory
            </Text>
          </View>
        </TouchableOpacity>

        <Card style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Example Input:</Text>
          <Text style={styles.exampleText}>
            "Dad always said 'measure twice, cut once' when working on projects. He taught me to fish when I was 8 years old at the lake. His sense of humor was legendary - he could make anyone laugh with his quick wit and silly puns. I remember the smell of his workshop, full of sawdust and old wood..."
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
          <Button
            title="Import Memories"
            onPress={handleImport}
            loading={importing}
            disabled={!text.trim()}
            style={styles.actionButton}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: Spacing.lg,
  },
  checkboxContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  checkboxDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  exampleCard: {
    marginVertical: Spacing.lg,
    backgroundColor: Colors.backgroundLight,
  },
  exampleTitle: {
    ...Typography.body,
    color: Colors.primaryLight,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  exampleText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
