import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { voiceService } from '../services/voiceService';

/**
 * AudioMessage Component
 *
 * Displays an audio message with playback controls.
 * - Never auto-plays (per safety rules)
 * - User must tap to play
 * - Shows duration and playback progress
 * - Replay always optional
 */

interface AudioMessageProps {
  audioUrl: string;
  duration?: number;
  isPersona?: boolean;
  transcript?: string;
  showTranscript?: boolean;
}

export default function AudioMessage({
  audioUrl,
  duration = 0,
  isPersona = false,
  transcript,
  showTranscript = true,
}: AudioMessageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  const sound = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying && sound.current) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // If no sound loaded, load it
      if (!sound.current) {
        setIsLoading(true);

        // Get full URL
        const fullUrl = voiceService.getAudioUrl(audioUrl);

        // Create sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: fullUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        sound.current = newSound;
        setIsLoading(false);
        setIsPlaying(true);
      } else {
        // Resume playback
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.durationMillis) {
      setTotalDuration(Math.ceil(status.durationMillis / 1000));
    }

    if (status.positionMillis !== undefined && status.durationMillis) {
      setCurrentTime(Math.ceil(status.positionMillis / 1000));
      setPlaybackProgress(status.positionMillis / status.durationMillis);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentTime(0);
      // Don't auto-reset - let user replay if they want
    }
  };

  const handleSeek = async (progress: number) => {
    if (sound.current && totalDuration > 0) {
      const positionMillis = progress * totalDuration * 1000;
      await sound.current.setPositionAsync(positionMillis);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, isPersona && styles.personaContainer]}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[styles.playButton, isPersona && styles.personaPlayButton]}
        onPress={handlePlayPause}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.text} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={Colors.text}
          />
        )}
      </TouchableOpacity>

      {/* Waveform / Progress */}
      <View style={styles.progressSection}>
        <View style={styles.waveformContainer}>
          {/* Simple progress bar (could be replaced with waveform visualization) */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${playbackProgress * 100}%` },
                isPersona && styles.personaProgressFill,
              ]}
            />
          </View>
        </View>

        {/* Time display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {isPlaying || currentTime > 0
              ? formatTime(currentTime)
              : formatTime(totalDuration)}
          </Text>
        </View>
      </View>

      {/* Voice indicator for persona */}
      {isPersona && (
        <View style={styles.voiceIndicator}>
          <Ionicons name="volume-medium" size={16} color={Colors.primaryLight} />
        </View>
      )}
    </View>
  );
}

// Separate component for displaying both audio and text
export function AudioTextMessage({
  audioUrl,
  duration,
  text,
  isPersona = false,
}: {
  audioUrl?: string;
  duration?: number;
  text: string;
  isPersona?: boolean;
}) {
  return (
    <View style={styles.audioTextContainer}>
      {/* Text is always visible - audio is supplementary */}
      <Text style={[styles.messageText, isPersona && styles.personaMessageText]}>
        {text}
      </Text>

      {/* Audio player if available */}
      {audioUrl && (
        <View style={styles.audioSection}>
          <AudioMessage
            audioUrl={audioUrl}
            duration={duration}
            isPersona={isPersona}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    minWidth: 200,
  },
  personaContainer: {
    backgroundColor: Colors.backgroundCard,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  personaPlayButton: {
    backgroundColor: Colors.primaryDark,
  },
  progressSection: {
    flex: 1,
  },
  waveformContainer: {
    marginBottom: Spacing.xs,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  personaProgressFill: {
    backgroundColor: Colors.primaryLight,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  voiceIndicator: {
    marginLeft: Spacing.sm,
  },
  // Audio + Text combo styles
  audioTextContainer: {
    flex: 1,
  },
  messageText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  personaMessageText: {
    // Same styling for persona
  },
  audioSection: {
    marginTop: Spacing.sm,
  },
});
