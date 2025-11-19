import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import Card from '../components/Card';

export default function SettingsScreen() {
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com');
  };

  const handleOpenSupport = () => {
    Linking.openURL('mailto:support@everspeak.app');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Ionicons name="server-outline" size={24} color={Colors.primary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>API Connection</Text>
              <Text style={styles.settingDescription}>localhost:3000</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity onPress={handleOpenSupport}>
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="mail-outline" size={24} color={Colors.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Support</Text>
                <Text style={styles.settingDescription}>Get help and support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenGitHub}>
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="logo-github" size={24} color={Colors.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Source Code</Text>
                <Text style={styles.settingDescription}>View on GitHub</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Everspeak is a grief support app designed to help you honor and reflect on your loved ones.
        </Text>
        <Text style={styles.footerCopyright}>
          © 2024 Everspeak. All rights reserved.
        </Text>
      </View>
    </ScrollView>
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
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  settingCard: {
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footerCopyright: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
