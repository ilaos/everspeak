import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

/**
 * VoiceRecorder Component
 *
 * WhatsApp-style press-and-hold voice recording:
 * - Press and hold to record
 * - Release to send
 * - Swipe left to cancel
 * - Visual feedback during recording
 *
 * Recording limits:
 * - Soft limit: 60 seconds (warning)
 * - Hard limit: 90 seconds (auto-stop)
 */

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string, duration: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const SOFT_LIMIT_SECONDS = 60;
const HARD_LIMIT_SECONDS = 90;
const CANCEL_SWIPE_THRESHOLD = -80; // Pixels to swipe left to cancel

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const recording = useRef<Audio.Recording | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation when recording
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Pan responder for swipe-to-cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRecording();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
          setIsCancelling(gestureState.dx < CANCEL_SWIPE_THRESHOLD);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < CANCEL_SWIPE_THRESHOLD) {
          cancelRecording();
        } else {
          stopRecording();
        }
        slideAnim.setValue(0);
        setIsCancelling(false);
      },
      onPanResponderTerminate: () => {
        cancelRecording();
        slideAnim.setValue(0);
        setIsCancelling(false);
      },
    })
  ).current;

  const startRecording = async () => {
    if (disabled) return;

    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone access to record voice messages');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;

          // Hard limit - auto stop
          if (newDuration >= HARD_LIMIT_SECONDS) {
            stopRecording();
            return newDuration;
          }

          return newDuration;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    try {
      setIsRecording(false);
      stopPulseAnimation();

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      const duration = recordingDuration;
      recording.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (uri && duration > 0) {
        onRecordingComplete(uri, duration);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const cancelRecording = async () => {
    if (!recording.current) return;

    try {
      setIsRecording(false);
      stopPulseAnimation();

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      await recording.current.stopAndUnloadAsync();
      recording.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecordingDuration(0);
      onCancel?.();
    } catch (err) {
      console.error('Failed to cancel recording:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <Animated.View
          style={[
            styles.recordingIndicator,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.recordingInfo}>
            <View style={[styles.recordingDot, isCancelling && styles.cancelDot]} />
            <Text style={[styles.durationText, isCancelling && styles.cancelText]}>
              {isCancelling ? 'Release to cancel' : formatDuration(recordingDuration)}
            </Text>
            {recordingDuration >= SOFT_LIMIT_SECONDS && !isCancelling && (
              <Text style={styles.warningText}>
                ({HARD_LIMIT_SECONDS - recordingDuration}s left)
              </Text>
            )}
          </View>
          <Text style={styles.swipeHint}>
            {isCancelling ? '' : '← Slide to cancel'}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.recordButtonWrapper,
          isRecording && { transform: [{ scale: pulseAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            isCancelling && styles.recordButtonCancel,
            disabled && styles.recordButtonDisabled,
          ]}
        >
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={28}
            color={
              disabled
                ? Colors.textMuted
                : isCancelling
                ? Colors.error
                : Colors.text
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButtonWrapper: {
    // Touch area
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  recordButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  recordButtonCancel: {
    backgroundColor: Colors.error + '40',
    borderColor: Colors.error,
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    marginRight: Spacing.sm,
  },
  cancelDot: {
    backgroundColor: Colors.textMuted,
  },
  durationText: {
    ...Typography.body,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  cancelText: {
    color: Colors.error,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: Spacing.sm,
  },
  swipeHint: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
