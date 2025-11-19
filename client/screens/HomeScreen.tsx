import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useSelectedPersona } from '../hooks/usePersona';
import Card from '../components/Card';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { selectedPersona, selectedPersonaId } = useSelectedPersona();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundCard]}
        style={styles.hero}
      >
        <Text style={styles.logo}>Everspeak</Text>
        <Text style={styles.tagline}>Honor. Reflect. Heal.</Text>

        {selectedPersona ? (
          <View style={styles.selectedPersonaCard}>
            <Ionicons name="person-circle" size={48} color={Colors.primaryLight} />
            <View style={styles.personaInfo}>
              <Text style={styles.currentPersonaLabel}>Currently honoring</Text>
              <Text style={styles.currentPersonaName}>{selectedPersona.name}</Text>
              {selectedPersona.relationship && (
                <Text style={styles.currentPersonaRelationship}>
                  {selectedPersona.relationship}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.noPersonaPrompt}>
            <Text style={styles.promptText}>
              Create a persona to begin your journey
            </Text>
            <TouchableOpacity
              style={styles.promptButton}
              onPress={() => navigation.navigate('Personas' as never)}
            >
              <Text style={styles.promptButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.quickAccessGrid}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Conversation' as never)}
            disabled={!selectedPersonaId}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: Colors.conversation + '20' }]}>
              <Ionicons name="chatbubbles" size={28} color={Colors.conversation} />
            </View>
            <Text style={styles.quickAccessTitle}>Conversation</Text>
            <Text style={styles.quickAccessDescription}>
              Have a meaningful conversation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Memories' as never)}
            disabled={!selectedPersonaId}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: Colors.memory + '20' }]}>
              <Ionicons name="images" size={28} color={Colors.memory} />
            </View>
            <Text style={styles.quickAccessTitle}>Memories</Text>
            <Text style={styles.quickAccessDescription}>
              Add and view memories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Journal' as never)}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: Colors.journal + '20' }]}>
              <Ionicons name="book" size={28} color={Colors.journal} />
            </View>
            <Text style={styles.quickAccessTitle}>Journal</Text>
            <Text style={styles.quickAccessDescription}>
              Reflect on your thoughts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Personas' as never)}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: Colors.persona + '20' }]}>
              <Ionicons name="people" size={28} color={Colors.persona} />
            </View>
            <Text style={styles.quickAccessTitle}>Personas</Text>
            <Text style={styles.quickAccessDescription}>
              Manage your loved ones
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>A Safe Space for Healing</Text>
            <Text style={styles.infoText}>
              Everspeak helps you process grief and honor the memory of your loved ones through AI-powered conversations, journaling, and memory keeping.
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  logo: {
    ...Typography.h1,
    fontSize: 40,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: Colors.primaryLight,
    marginBottom: Spacing.xl,
  },
  selectedPersonaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: '100%',
    ...Shadows.md,
  },
  personaInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  currentPersonaLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  currentPersonaName: {
    ...Typography.h2,
    color: Colors.text,
  },
  currentPersonaRelationship: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
  },
  noPersonaPrompt: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    ...Shadows.md,
  },
  promptText: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  promptButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    margin: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  quickAccessTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  quickAccessDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
});
