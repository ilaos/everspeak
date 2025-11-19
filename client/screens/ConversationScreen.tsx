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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { ChatMessage } from '../types';
import { chatService } from '../services/chatService';
import { useSelectedPersona } from '../hooks/usePersona';
import { format } from 'date-fns';

export default function ConversationScreen() {
  const { selectedPersona, selectedPersonaId, loading: personaLoading } = useSelectedPersona();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Clear messages when persona changes
    if (selectedPersonaId) {
      setMessages([]);
    }
  }, [selectedPersonaId]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedPersonaId || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      persona_id: selectedPersonaId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      setSending(true);
      const response = await chatService.sendMessage({
        user_message: userMessage.content,
        persona_id: selectedPersonaId,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.reply,
        timestamp: new Date().toISOString(),
        persona_id: selectedPersonaId,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Scroll to bottom after AI responds
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessage = {
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

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.type === 'user';
    const showAvatar = index === messages.length - 1 || messages[index + 1]?.type !== item.type;

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
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
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
        <View>
          <Text style={styles.roomTitle}>Conversation with {selectedPersona.name}</Text>
          <Text style={styles.roomSubtitle}>
            This is a safe space to honor and reflect
          </Text>
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

      {/* Input area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
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
            onPress={handleSend}
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
      </View>
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
  roomTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roomSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
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
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  userTimestamp: {
    color: Colors.textSecondary,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...Typography.body,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundLight,
  },
});
