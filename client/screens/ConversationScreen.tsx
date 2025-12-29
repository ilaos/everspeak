import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { ChatMessage } from '../types';
import { chatService } from '../services/chatService';
import { voiceService, VoiceSettings } from '../services/voiceService';
import { useSelectedPersona } from '../hooks/usePersona';
import { format } from 'date-fns';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioMessage from '../components/AudioMessage';
import VoiceSettingsComponent from '../components/VoiceSettings';

// Extended message type with audio support
interface VoiceChatMessage extends ChatMessage {
  audioUrl?: string;
  audioDuration?: number;
  isVoiceInput?: boolean;
}

export default function ConversationScreen() {
  const { selectedPersona, selectedPersonaId, loading: personaLoading } = useSelectedPersona();
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Clear messages when persona changes
    if (selectedPersonaId) {
      setMessages([]);
      loadVoiceSettings();
    }
  }, [selectedPersonaId]);

  const loadVoiceSettings = async () => {
    if (!selectedPersonaId) return;
    try {
      const response = await voiceService.getVoiceSettings(selectedPersonaId);
      if (response.success) {
        setVoiceSettings(response.data.voice);
      }
    } catch (err) {
      console.error('Failed to load voice settings:', err);
    }
  };

  const handleSend = async (
    content: string,
    audioUri?: string,
    audioDuration?: number,
    isVoice: boolean = false
  ) => {
    if (!content.trim() || !selectedPersonaId || sending) return;

    const userMessage: VoiceChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      persona_id: selectedPersonaId,
      audioUrl: audioUri,
      audioDuration,
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      setSending(true);
      const response = await chatService.sendMessage({
        user_message: userMessage.content,
        persona_id: selectedPersonaId,
      });

      const aiTextReply = response.data.reply;

      // Try to generate voice if enabled
      let voiceData: { url: string; duration: number } | undefined;

      if (voiceSettings?.enabled) {
        try {
          const voiceResponse = await voiceService.generateVoiceReply(
            selectedPersonaId,
            aiTextReply,
            userMessage.content
          );

          if (voiceResponse.success && voiceResponse.data.voiceGenerated && voiceResponse.data.audio) {
            voiceData = {
              url: voiceResponse.data.audio.url,
              duration: voiceResponse.data.audio.duration,
            };
          }
          // Note: If voice was disabled due to safety, we silently fall back to text
          // No announcement per spec
        } catch (err) {
          console.error('Voice generation failed:', err);
          // Silently fall back to text
        }
      }

      const aiMessage: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiTextReply,
        timestamp: new Date().toISOString(),
        persona_id: selectedPersonaId,
        audioUrl: voiceData?.url,
        audioDuration: voiceData?.duration,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Scroll to bottom after AI responds
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMessage: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I couldn\'t respond right now. Please make sure the backend is running and try again.',
        timestamp: new Date().toISOString(),
        persona_id: selectedPersonaId,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleTextSend = () => {
    handleSend(inputText);
  };

  const handleVoiceRecordingComplete = async (audioUri: string, duration: number) => {
    if (!selectedPersonaId) return;

    try {
      setIsTranscribing(true);

      // Fetch audio file and transcribe
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const transcription = await voiceService.transcribeAudio(blob, 'voice_message.webm');

      if (transcription.success && transcription.text) {
        // Send with both audio and transcription
        handleSend(transcription.text, audioUri, duration, true);
      } else {
        Alert.alert('Transcription failed', 'Could not transcribe audio. Please try again.');
      }
    } catch (err) {
      console.error('Voice processing failed:', err);
      Alert.alert('Error', 'Failed to process voice message');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleInputMode = () => {
    setInputMode((prev) => (prev === 'text' ? 'voice' : 'text'));
  };

  const renderMessage = ({ item, index }: { item: VoiceChatMessage; index: number }) => {
    const isUser = item.type === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="person-circle" size={32} color={Colors.primaryLight} />
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && (
            <Text style={styles.senderName}>{selectedPersona?.name}</Text>
          )}

          {/* Text content - always shown (text is source of truth) */}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>

          {/* Audio player if available */}
          {item.audioUrl && (
            <View style={styles.audioContainer}>
              <AudioMessage
                audioUrl={item.audioUrl}
                duration={item.audioDuration}
                isPersona={!isUser}
              />
            </View>
          )}

          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.isVoiceInput && <Ionicons name="mic" size={10} color={Colors.textMuted} />}
            {' '}
            {format(new Date(item.timestamp), 'h:mm a')}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person-circle-outline" size={32} color={Colors.textSecondary} />
          </View>
        )}
      </View>
    );
  };

  if (personaLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!selectedPersona) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No Persona Selected</Text>
        <Text style={styles.emptyText}>
          Please select a persona to begin a conversation
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.background, Colors.backgroundCard, Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Room header */}
      <View style={styles.roomHeader}>
        <View style={styles.roomHeaderContent}>
          <View>
            <Text style={styles.roomTitle}>Conversation with {selectedPersona.name}</Text>
            <Text style={styles.roomSubtitle}>
              This is a safe space to honor and reflect
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowVoiceSettings(true)}
          >
            <Ionicons
              name={voiceSettings?.enabled ? 'volume-high' : 'volume-mute'}
              size={24}
              color={voiceSettings?.enabled ? Colors.primaryLight : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyConversation}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyConversationText}>
              Begin when it feels right
            </Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Transcribing indicator */}
      {isTranscribing && (
        <View style={styles.transcribingBanner}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.transcribingText}>Transcribing...</Text>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        {inputMode === 'text' ? (
          <View style={styles.inputWrapper}>
            {/* Voice mode toggle */}
            <TouchableOpacity
              style={styles.modeToggle}
              onPress={toggleInputMode}
              disabled={sending}
            >
              <Ionicons name="mic-outline" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              editable={!sending}
            />

            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleTextSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Ionicons
                  name="send"
                  size={24}
                  color={inputText.trim() ? Colors.text : Colors.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.voiceInputWrapper}>
            {/* Text mode toggle */}
            <TouchableOpacity
              style={styles.modeToggle}
              onPress={toggleInputMode}
              disabled={sending || isTranscribing}
            >
              <Ionicons name="text-outline" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Voice recorder */}
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              disabled={sending || isTranscribing}
            />
          </View>
        )}
      </View>

      {/* Voice Settings Modal */}
      <Modal
        visible={showVoiceSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVoiceSettings(false)}
      >
        <VoiceSettingsComponent
          personaId={selectedPersonaId!}
          onClose={() => {
            setShowVoiceSettings(false);
            loadVoiceSettings(); // Refresh settings
          }}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  roomHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  roomHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roomSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyConversation: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyConversationText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
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
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  userAvatar: {
    marginLeft: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  aiBubble: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    ...Typography.caption,
    color: Colors.primaryLight,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  messageText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  audioContainer: {
    marginTop: Spacing.sm,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  userTimestamp: {
    color: Colors.textSecondary,
  },
  transcribingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  transcribingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  voiceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  modeToggle: {
    padding: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...Typography.body,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundLight,
  },
});
