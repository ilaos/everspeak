import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { RootStackParamList } from '../navigation/RootNavigator';
import { onboardingService } from '../services/onboardingService';
import { onboardingPersistence, DraftAnswer } from '../services/onboardingPersistence';
import {
  OnboardingQuestion,
  OnboardingSection,
  OnboardingAnswer,
  OnboardingProgress,
} from '../types';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface QuestionWithAnswer extends OnboardingQuestion {
  answer?: OnboardingAnswer | null;
  section?: OnboardingSection;
}

export default function OnboardingScreen({ route, navigation }: Props) {
  const { personaId, personaName } = route.params;

  // State
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [sections, setSections] = useState<OnboardingSection[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Current question input state
  const [textInput, setTextInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Voice recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Dev tools state
  const [showDevTools, setShowDevTools] = useState(false);
  const [skipStepInput, setSkipStepInput] = useState('');

  // Navigation state to prevent double-tap issues
  const [isNavigating, setIsNavigating] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  // Flag to skip draft saving when loading values from existing answers
  const isLoadingAnswerRef = useRef(false);
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions and answers
  useEffect(() => {
    loadData();
  }, [personaId]);

  // Debounced draft saving function
  const saveDraftDebounced = useCallback((draft: DraftAnswer) => {
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }
    draftTimeoutRef.current = setTimeout(async () => {
      try {
        await onboardingPersistence.saveDraftAnswer(personaId, draft);
      } catch (err) {
        console.error('Failed to save draft:', err);
      }
    }, 300); // 300ms debounce
  }, [personaId]);

  // Save current state on navigation or input changes
  const saveCurrentState = useCallback(async (questionIndex?: number) => {
    try {
      await onboardingPersistence.saveState({
        personaId,
        personaName,
        currentQuestionIndex: questionIndex ?? currentQuestionIndex,
        progress,
        lastUpdated: new Date().toISOString(),
        isComplete: false,
      });
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  }, [personaId, personaName, currentQuestionIndex, progress]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Load persisted state first
      const persistedState = await onboardingPersistence.getState(personaId);
      const persistedDrafts = await onboardingPersistence.getPersonaDrafts(personaId);

      console.log('[Onboarding] Loaded persisted state:', persistedState);
      console.log('[Onboarding] Loaded drafts count:', Object.keys(persistedDrafts).length);

      // 2. Get questions structure from server
      const questionsRes = await onboardingService.getQuestions();
      if (questionsRes.success) {
        setSections(questionsRes.data.sections);

        // 3. Get answers from server
        const answersRes = await onboardingService.getPersonaAnswers(personaId);
        if (answersRes.success) {
          setProgress(answersRes.data.progress);

          // 4. Merge server answers with persisted drafts (drafts take priority)
          const questionsWithAnswers = questionsRes.data.questions.map((q) => {
            const serverAnswer = answersRes.data.answers.find((a) => a.questionId === q.id);
            const draft = persistedDrafts[q.id];
            const section = questionsRes.data.sections.find((s) => s.id === q.sectionId);

            // If we have a local draft, merge it with server answer
            let answer = serverAnswer;
            if (draft) {
              answer = {
                ...(serverAnswer || {
                  id: `draft-${q.id}`,
                  personaId,
                  questionId: q.id,
                  media: { photos: [], audio: [], video: [] },
                  createdAt: draft.lastUpdated,
                  updatedAt: draft.lastUpdated,
                }),
                textResponse: draft.textInput || serverAnswer?.textResponse || null,
                voiceTranscript: draft.voiceTranscript || serverAnswer?.voiceTranscript || null,
                selectedOption: draft.selectedOption || serverAnswer?.selectedOption || null,
              } as OnboardingAnswer;
            }

            return { ...q, answer, section };
          });
          setQuestions(questionsWithAnswers);

          // 5. Resume from persisted step or find first unanswered
          let startIndex = 0;
          if (persistedState && persistedState.currentQuestionIndex !== undefined) {
            // Resume from persisted state
            startIndex = Math.min(
              persistedState.currentQuestionIndex,
              questionsWithAnswers.length - 1
            );
            console.log('[Onboarding] Resuming from step:', startIndex);
          } else {
            // Find first unanswered question
            const firstUnanswered = questionsWithAnswers.findIndex(
              (q) => !q.answer?.textResponse && !q.answer?.voiceTranscript && !q.answer?.selectedOption
            );
            startIndex = firstUnanswered >= 0 ? firstUnanswered : 0;
          }
          setCurrentQuestionIndex(startIndex);

          // 6. Save initial state
          await onboardingPersistence.saveState({
            personaId,
            personaName,
            currentQuestionIndex: startIndex,
            progress: answersRes.data.progress,
            lastUpdated: new Date().toISOString(),
            isComplete: false,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding data:', err);
      Alert.alert('Error', 'Failed to load onboarding questions');
    } finally {
      setLoading(false);
    }
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Update input state when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Set flag to skip draft saving while loading existing answer
      isLoadingAnswerRef.current = true;
      setTextInput(currentQuestion.answer?.textResponse || '');
      setVoiceTranscript(currentQuestion.answer?.voiceTranscript || '');
      setSelectedOption(currentQuestion.answer?.selectedOption || null);
      // Clear flag after state updates have settled
      setTimeout(() => {
        isLoadingAnswerRef.current = false;
      }, 50);
    }
  }, [currentQuestionIndex, currentQuestion?.id]);

  // Save draft whenever inputs change (skip if loading from existing answer)
  useEffect(() => {
    if (!currentQuestion) return;
    // Skip saving if we're just loading existing values
    if (isLoadingAnswerRef.current) return;

    // Only save if there's actual content
    if (textInput || voiceTranscript || selectedOption) {
      saveDraftDebounced({
        questionId: currentQuestion.id,
        textInput,
        voiceTranscript,
        selectedOption,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [textInput, voiceTranscript, selectedOption, currentQuestion?.id]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, []);

  // Audio recording setup
  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone access to record voice input');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      // Get the recorded URI
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Transcribe the audio
        setIsTranscribing(true);
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const result = await onboardingService.transcribeAudio(blob, 'recording.webm');
          if (result.success && result.text) {
            setVoiceTranscript(result.text);
            // Auto-save after transcription
            await saveAnswer(result.text, textInput, selectedOption);
          }
        } catch (err) {
          console.error('Transcription failed:', err);
          Alert.alert('Transcription failed', 'Could not transcribe audio. Please try again or type your response.');
        } finally {
          setIsTranscribing(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Save answer
  const saveAnswer = async (
    transcript?: string,
    text?: string,
    option?: string | null
  ) => {
    if (!currentQuestion) return;

    try {
      setSaving(true);
      const response = await onboardingService.saveAnswer(personaId, currentQuestion.id, {
        voiceTranscript: transcript || voiceTranscript || undefined,
        textResponse: text || textInput || undefined,
        selectedOption: option !== undefined ? option || undefined : selectedOption || undefined,
      });

      if (response.success) {
        setProgress(response.data.progress);

        // Update the question's answer in state
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === currentQuestion.id ? { ...q, answer: response.data.answer } : q
          )
        );

        // Clear draft after successful server save
        await onboardingPersistence.clearDraft(personaId, currentQuestion.id);

        // Update persisted state with new progress
        await onboardingPersistence.saveState({
          personaId,
          personaName,
          currentQuestionIndex,
          progress: response.data.progress,
          lastUpdated: new Date().toISOString(),
          isComplete: response.data.progress.percentComplete === 100,
        });
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
      // Draft is preserved on failure - will be synced later
    } finally {
      setSaving(false);
    }
  };

  // Handle text input blur (auto-save) - non-blocking
  const handleTextBlur = () => {
    if (textInput && textInput !== currentQuestion?.answer?.textResponse) {
      // Use setTimeout to prevent blur from blocking touch events on buttons
      setTimeout(() => {
        saveAnswer(voiceTranscript, textInput, selectedOption);
      }, 0);
    }
  };

  // Handle option selection
  const handleOptionSelect = async (value: string) => {
    setSelectedOption(value);
    await saveAnswer(voiceTranscript, textInput, value);
  };

  // Navigation - non-blocking with debounce to prevent double-tap
  const goToNext = () => {
    if (isNavigating || currentQuestionIndex >= questions.length - 1) return;

    setIsNavigating(true);
    const nextIndex = currentQuestionIndex + 1;

    // Update state immediately for responsive UI
    setCurrentQuestionIndex(nextIndex);

    // Scroll after a brief delay to ensure new content is rendered
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setIsNavigating(false);
    }, 100);

    // Save state in background (non-blocking)
    saveCurrentState(nextIndex).catch(console.error);
  };

  const goToPrevious = () => {
    if (isNavigating || currentQuestionIndex <= 0) return;

    setIsNavigating(true);
    const prevIndex = currentQuestionIndex - 1;

    setCurrentQuestionIndex(prevIndex);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setIsNavigating(false);
    }, 100);

    // Save state in background (non-blocking)
    saveCurrentState(prevIndex).catch(console.error);
  };

  const handleClose = () => {
    // Save state in background, navigate immediately
    saveCurrentState().catch(console.error);
    navigation.goBack();
  };

  // Media picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'photos';
        const filename = asset.uri.split('/').pop() || 'media';

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        await onboardingService.uploadMedia(
          personaId,
          currentQuestion.id,
          blob,
          filename,
          mediaType
        );

        // Refresh data
        loadData();
      } catch (err) {
        console.error('Failed to upload media:', err);
        Alert.alert('Upload failed', 'Could not upload media. Please try again.');
      }
    }
  };

  // Check if current question has any response
  const hasResponse = () => {
    return !!(textInput || voiceTranscript || selectedOption);
  };

  // ==================== DEV TOOLS ====================
  const handleDevReset = async () => {
    try {
      await onboardingPersistence.resetOnboarding(personaId);
      Alert.alert('Dev Tools', 'Onboarding reset. Reloading...');
      loadData();
      setShowDevTools(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const handleDevLoadSample = async () => {
    try {
      await onboardingPersistence.loadSamplePersona(personaId);
      Alert.alert('Dev Tools', 'Sample persona loaded. Reloading...');
      loadData();
      setShowDevTools(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load sample persona');
    }
  };

  const handleDevSkipToStep = async () => {
    const stepNum = parseInt(skipStepInput, 10);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > questions.length) {
      Alert.alert('Invalid Step', `Enter a number between 1 and ${questions.length}`);
      return;
    }
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      const targetIndex = stepNum - 1;
      // Save in background, update UI immediately
      onboardingPersistence.skipToStep(personaId, personaName, targetIndex).catch(console.error);
      setCurrentQuestionIndex(targetIndex);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        setIsNavigating(false);
      }, 100);
      setSkipStepInput('');
      setShowDevTools(false);
    } catch (err) {
      setIsNavigating(false);
      Alert.alert('Error', 'Failed to skip to step');
    }
  };

  const handleDevExport = async () => {
    try {
      const data = await onboardingPersistence.exportData();
      console.log('[DevTools] Exported data:', data);
      Alert.alert('Dev Tools', 'Data exported to console. Check logs.');
    } catch (err) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  // Dev tools modal component
  const renderDevTools = () => {
    if (!__DEV__) return null;

    return (
      <>
        {/* Floating dev tools button */}
        <TouchableOpacity
          style={styles.devToolsButton}
          onPress={() => setShowDevTools(true)}
        >
          <Ionicons name="construct" size={20} color={Colors.text} />
        </TouchableOpacity>

        {/* Dev tools modal */}
        {showDevTools && (
          <View style={styles.devToolsOverlay}>
            <View style={styles.devToolsModal}>
              <View style={styles.devToolsHeader}>
                <Text style={styles.devToolsTitle}>Dev Tools</Text>
                <TouchableOpacity onPress={() => setShowDevTools(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.devToolsContent}>
                {/* Current state info */}
                <View style={styles.devToolsInfo}>
                  <Text style={styles.devToolsInfoText}>
                    Persona: {personaId.slice(0, 8)}...
                  </Text>
                  <Text style={styles.devToolsInfoText}>
                    Step: {currentQuestionIndex + 1}/{questions.length}
                  </Text>
                  <Text style={styles.devToolsInfoText}>
                    Progress: {progress?.percentComplete || 0}%
                  </Text>
                </View>

                {/* Actions */}
                <TouchableOpacity style={styles.devToolsActionBtn} onPress={handleDevReset}>
                  <Ionicons name="refresh" size={20} color={Colors.error} />
                  <Text style={[styles.devToolsActionText, { color: Colors.error }]}>
                    Reset Onboarding
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.devToolsActionBtn} onPress={handleDevLoadSample}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                  <Text style={[styles.devToolsActionText, { color: Colors.primary }]}>
                    Load Sample Persona
                  </Text>
                </TouchableOpacity>

                <View style={styles.devToolsSkipRow}>
                  <TextInput
                    style={styles.devToolsSkipInput}
                    placeholder="Step #"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={skipStepInput}
                    onChangeText={setSkipStepInput}
                  />
                  <TouchableOpacity
                    style={[styles.devToolsActionBtn, { flex: 1 }]}
                    onPress={handleDevSkipToStep}
                  >
                    <Ionicons name="play-skip-forward" size={20} color={Colors.info} />
                    <Text style={[styles.devToolsActionText, { color: Colors.info }]}>
                      Skip to Step
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.devToolsActionBtn} onPress={handleDevExport}>
                  <Ionicons name="download" size={20} color={Colors.textSecondary} />
                  <Text style={[styles.devToolsActionText, { color: Colors.textSecondary }]}>
                    Export Debug Data
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.background, Colors.backgroundCard]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No questions found</Text>
        <Button title="Go Back" onPress={handleClose} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundCard, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Creating {personaName}</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestion.questionNumber} of {questions.length}
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress?.percentComplete || 0}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress?.percentComplete || 0}% complete</Text>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section indicator */}
        {currentQuestion.section && (
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionText}>{currentQuestion.section.title}</Text>
          </View>
        )}

        {/* Question prompt */}
        <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>

        {/* Input type based on question */}
        {currentQuestion.inputType === 'select' && currentQuestion.options ? (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedOption === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleOptionSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedOption === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            {/* Voice recording button - PRIMARY */}
            <View style={styles.voiceInputContainer}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="large" color={Colors.text} />
                ) : (
                  <Ionicons
                    name={isRecording ? 'mic' : 'mic-outline'}
                    size={48}
                    color={Colors.text}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.voiceHint}>
                {isRecording
                  ? 'Recording... release to stop'
                  : isTranscribing
                  ? 'Transcribing...'
                  : 'Hold to record'}
              </Text>
            </View>

            {/* Voice transcript display */}
            {voiceTranscript ? (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Your voice response:</Text>
                <Text style={styles.transcriptText}>{voiceTranscript}</Text>
              </View>
            ) : null}

            {/* Text input as alternative */}
            <View style={styles.textInputContainer}>
              <Text style={styles.textInputLabel}>Or type your response:</Text>
              <TextInput
                style={styles.textInput}
                value={textInput}
                onChangeText={setTextInput}
                onBlur={handleTextBlur}
                placeholder="Type here..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Media hint and upload */}
            {currentQuestion.mediaHint && (
              <View style={styles.mediaContainer}>
                <Text style={styles.mediaHintText}>
                  {currentQuestion.mediaHint === 'photos_videos_encouraged'
                    ? 'Photos or videos are encouraged but optional'
                    : 'Audio clips are encouraged but optional'}
                </Text>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                  <Ionicons name="attach" size={24} color={Colors.primary} />
                  <Text style={styles.mediaButtonText}>Add media</Text>
                </TouchableOpacity>

                {/* Show attached media count */}
                {currentQuestion.answer?.media && (
                  <View style={styles.mediaCount}>
                    {currentQuestion.answer.media.photos.length > 0 && (
                      <Text style={styles.mediaCountText}>
                        {currentQuestion.answer.media.photos.length} photo(s)
                      </Text>
                    )}
                    {currentQuestion.answer.media.video.length > 0 && (
                      <Text style={styles.mediaCountText}>
                        {currentQuestion.answer.media.video.length} video(s)
                      </Text>
                    )}
                    {currentQuestion.answer.media.audio.length > 0 && (
                      <Text style={styles.mediaCountText}>
                        {currentQuestion.answer.media.audio.length} audio file(s)
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Navigation footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentQuestionIndex === 0 ? Colors.textMuted : Colors.text}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.finishButton} onPress={handleClose}>
            <Text style={styles.finishButtonText}>Finish</Text>
            <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <Text style={styles.navButtonText}>
              {hasResponse() ? 'Next' : 'Skip'}
            </Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dev tools (development only) */}
      {renderDevTools()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionText: {
    ...Typography.caption,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  questionPrompt: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xl,
    lineHeight: 32,
  },
  // Voice input
  voiceInputContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  recordButtonActive: {
    backgroundColor: Colors.error + '40',
    borderColor: Colors.error,
  },
  voiceHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  transcriptContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  transcriptLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  transcriptText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
  // Text input
  textInputContainer: {
    marginBottom: Spacing.lg,
  },
  textInputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    ...Typography.body,
    minHeight: 100,
  },
  // Options (select)
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  optionText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  // Media
  mediaContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
  },
  mediaHintText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  mediaButtonText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  mediaCount: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  mediaCountText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    ...Typography.body,
    color: Colors.text,
    marginHorizontal: Spacing.xs,
  },
  navButtonTextDisabled: {
    color: Colors.textMuted,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  finishButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  // Dev tools
  devToolsButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  devToolsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  devToolsModal: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devToolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  devToolsTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  devToolsContent: {
    gap: Spacing.md,
  },
  devToolsInfo: {
    backgroundColor: Colors.backgroundLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  devToolsInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  devToolsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  devToolsActionText: {
    ...Typography.body,
    fontWeight: '500',
  },
  devToolsSkipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  devToolsSkipInput: {
    width: 70,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    textAlign: 'center',
    ...Typography.body,
  },
});
