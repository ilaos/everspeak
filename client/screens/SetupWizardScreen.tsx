import React, { useState } from 'react';
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
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RouteParams = {
  SetupWizard: {
    personaId: string;
    personaName: string;
  };
};

export default function SetupWizardScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SetupWizard'>>();
  const { personaId, personaName } = route.params;

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Personality Traits
  const [personalityTraits, setPersonalityTraits] = useState('');

  // Step 2: Sense of Humor
  const [senseOfHumor, setSenseOfHumor] = useState('');

  // Step 3: Favorite Memories
  const [favoriteMemories, setFavoriteMemories] = useState('');

  // Step 4: Memorable Conversations
  const [memorableConversations, setMemorableConversations] = useState('');

  // Step 5: Tone Calibration
  const [humorLevel, setHumorLevel] = useState('3');
  const [honestyLevel, setHonestyLevel] = useState('3');
  const [sentimentalityLevel, setSentimentalityLevel] = useState('3');
  const [energyLevel, setEnergyLevel] = useState('3');
  const [adviceLevel, setAdviceLevel] = useState('2');

  const totalSteps = 6;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return personalityTraits.trim().length > 0;
      case 2:
        return senseOfHumor.trim().length > 0;
      case 3:
        return favoriteMemories.trim().length > 0;
      case 4:
        return memorableConversations.trim().length > 0;
      case 5:
        return true; // Tone levels have defaults
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setSaving(true);

      const wizardData = {
        personality_traits: personalityTraits,
        sense_of_humor: senseOfHumor,
        favorite_memories: favoriteMemories,
        memorable_conversations: memorableConversations,
        tone_preferences: {
          humor_level: parseInt(humorLevel),
          honesty_level: parseInt(honestyLevel),
          sentimentality_level: parseInt(sentimentalityLevel),
          energy_level: parseInt(energyLevel),
          advice_level: parseInt(adviceLevel),
        },
      };

      await personaService.runWizard(personaId, wizardData);

      Alert.alert(
        'Success!',
        `The wizard has created memories for ${personaName} based on your inputs. A snapshot has been saved.`,
        [
          {
            text: 'View Memories',
            onPress: () => {
              navigation.goBack();
              // Navigate to memories screen
              (navigation as any).navigate('Memories');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete wizard');
    } finally {
      setSaving(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index + 1 <= currentStep && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="sparkles-outline" size={48} color={Colors.primary} />
            <Text style={styles.stepTitle}>Personality Traits</Text>
            <Text style={styles.stepDescription}>
              Describe {personaName} in 3 words or phrases that capture their essence
            </Text>
            <Input
              label="Personality Traits"
              value={personalityTraits}
              onChangeText={setPersonalityTraits}
              placeholder="e.g., warm, funny, gentle"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              💡 Tip: Think about how others would describe them
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="happy-outline" size={48} color={Colors.primary} />
            <Text style={styles.stepTitle}>Sense of Humor</Text>
            <Text style={styles.stepDescription}>
              What made {personaName} laugh? Share examples of their humor
            </Text>
            <Input
              label="Humor Examples"
              value={senseOfHumor}
              onChangeText={setSenseOfHumor}
              placeholder="e.g., He loved dad jokes and puns..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              💡 Tip: Include specific jokes or funny moments
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="images-outline" size={48} color={Colors.primary} />
            <Text style={styles.stepTitle}>Favorite Memories</Text>
            <Text style={styles.stepDescription}>
              Share your favorite memories with {personaName}
            </Text>
            <Input
              label="Memories"
              value={favoriteMemories}
              onChangeText={setFavoriteMemories}
              placeholder="e.g., We went fishing every summer at the lake..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              💡 Tip: Include sensory details - sights, sounds, feelings
            </Text>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.primary} />
            <Text style={styles.stepTitle}>Memorable Conversations</Text>
            <Text style={styles.stepDescription}>
              What did {personaName} say that stuck with you?
            </Text>
            <Input
              label="Conversations"
              value={memorableConversations}
              onChangeText={setMemorableConversations}
              placeholder="e.g., He once told me 'Always be yourself'..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              💡 Tip: Try to remember their exact words or advice
            </Text>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="options-outline" size={48} color={Colors.primary} />
            <Text style={styles.stepTitle}>Tone Calibration</Text>
            <Text style={styles.stepDescription}>
              How should {personaName} communicate in conversations?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Humor Level: {humorLevel}</Text>
              <View style={styles.sliderRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      parseInt(humorLevel) === level && styles.sliderButtonActive,
                    ]}
                    onPress={() => setHumorLevel(level.toString())}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        parseInt(humorLevel) === level && styles.sliderButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Honesty Level: {honestyLevel}</Text>
              <View style={styles.sliderRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      parseInt(honestyLevel) === level && styles.sliderButtonActive,
                    ]}
                    onPress={() => setHonestyLevel(level.toString())}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        parseInt(honestyLevel) === level && styles.sliderButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Sentimentality Level: {sentimentalityLevel}</Text>
              <View style={styles.sliderRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      parseInt(sentimentalityLevel) === level && styles.sliderButtonActive,
                    ]}
                    onPress={() => setSentimentalityLevel(level.toString())}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        parseInt(sentimentalityLevel) === level && styles.sliderButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Energy Level: {energyLevel}</Text>
              <View style={styles.sliderRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      parseInt(energyLevel) === level && styles.sliderButtonActive,
                    ]}
                    onPress={() => setEnergyLevel(level.toString())}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        parseInt(energyLevel) === level && styles.sliderButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Advice Level: {adviceLevel}</Text>
              <View style={styles.sliderRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      parseInt(adviceLevel) === level && styles.sliderButtonActive,
                    ]}
                    onPress={() => setAdviceLevel(level.toString())}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        parseInt(adviceLevel) === level && styles.sliderButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
            <Text style={styles.stepTitle}>Ready to Generate</Text>
            <Text style={styles.stepDescription}>
              The AI will now analyze your inputs and create structured memories for {personaName}
            </Text>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>What happens next:</Text>
              <View style={styles.summaryItem}>
                <Ionicons name="flash" size={20} color={Colors.primary} />
                <Text style={styles.summaryText}>
                  AI extracts memories from your free-form text
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="file-tray-full" size={20} color={Colors.primary} />
                <Text style={styles.summaryText}>
                  Memories are categorized and weighted automatically
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="save" size={20} color={Colors.primary} />
                <Text style={styles.summaryText}>
                  A snapshot is created so you can restore later
                </Text>
              </View>
            </Card>

            <Text style={styles.hint}>
              ⚠️ This may take 10-30 seconds depending on the amount of text
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Wizard</Text>
        <Text style={styles.headerSubtitle}>Creating {personaName}</Text>
      </View>

      {renderProgressBar()}
      {renderStepIndicator()}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.navigation}>
        <Button
          title="Previous"
          variant="outline"
          onPress={handlePrevious}
          disabled={currentStep === 1}
          style={styles.navButton}
        />

        {currentStep === totalSteps ? (
          <Button
            title="Complete Wizard"
            onPress={handleComplete}
            loading={saving}
            style={styles.navButton}
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!canProceed()}
            style={styles.navButton}
          />
        )}
      </View>
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
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.lg,
    top: Spacing.lg,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  hint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  sliderLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sliderButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  sliderButtonTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  summaryCard: {
    width: '100%',
    marginVertical: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
});
