import { useState, useRef, useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Alert, Animated } from 'react-native';
import { Mic, MicOff, Send, Volume2, VolumeX, Settings } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import type { ChatMessage } from '@/types';
import { useAppTheme } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

export default function ChatScreen() {
  const { colors } = useAppTheme();
  const voiceEnabled = useAppStore((state) => state.voiceEnabled);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'text' | 'voice'>('text');
  const [recordingAmplitude, setRecordingAmplitude] = useState(new Animated.Value(0));
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Martin, your AI assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Voice animation
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAmplitude, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(recordingAmplitude, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(recordingAmplitude, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isListening]);

  const handleVoiceToggle = async () => {
    if (!voiceEnabled) {
      Alert.alert(
        'Voice Disabled',
        'Voice features are currently disabled. Enable voice in settings to use voice chat.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (isListening) {
        await stopVoiceRecording();
      } else {
        await startVoiceRecording();
      }
    } catch (error: any) {
      Alert.alert('Voice Error', error.message || 'Voice recording failed');
    }
  };

  const startVoiceRecording = async () => {
    // TODO: Integrate with Vapi SDK
    Alert.alert('Voice Recording', 'Voice recording will start here with Vapi integration');
    setIsListening(true);
    setVoiceMode('voice');
  };

  const stopVoiceRecording = async () => {
    // TODO: Process voice input and send to Vapi
    Alert.alert('Voice Processing', 'Voice input will be processed here');
    setIsListening(false);

    // Mock voice-to-text conversion
    const transcribedText = 'Hello, this is my voice message to Martin!';
    setMessage(transcribedText);

    // Auto-send after transcription
    setTimeout(() => {
      sendVoiceMessage(transcribedText);
    }, 1000);
  };

  const sendVoiceMessage = async (text: string) => {
    try {
      setIsPlayingAudio(true);

      // TODO: Send to voice API and play response
      Alert.alert('Voice Response', 'Playing AI voice response...');

      // Mock AI response playback
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3000);
    } catch (error: any) {
      Alert.alert('Voice Response Error', error.message || 'Failed to get voice response');
      setIsPlayingAudio(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await apiClient.getChatHistory(20);
      if (response.success && response.data && response.data.length > 0) {
        const formattedMessages = response.data.map((msg: any) => ({
          id: msg.id?.toString() || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at || new Date().toISOString(),
        }));
        setMessages(prev => [...prev, ...formattedMessages.slice(-10)]); // Load last 10 messages
      }
    } catch (error) {
      console.warn('Failed to load chat history, using defaults');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await apiClient.sendMessage(text);
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.content || 'I received your message.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response from API');
      }
    } catch (error: any) {
      console.warn('Chat API failed, showing fallback:', error);
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m having trouble responding right now, but I\'m here to help! Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleSendPress = () => {
    if (message.trim() && !isTyping) {
      sendMessage(message);
    }
  };

  const handleVoiceSettings = () => {
    Alert.alert(
      'Voice Settings',
      'Choose voice preferences:',
      [
        { text: 'Voice Personality', onPress: () => Alert.alert('Coming Soon', 'Voice personality selection') },
        { text: 'Voice Speed', onPress: () => Alert.alert('Coming Soon', 'Voice speed control') },
        { text: 'Language', onPress: () => Alert.alert('Coming Soon', 'Language selection') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Screen title="AI Chat" subtitle="Conversational assistant with voice and text." scrollable={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                {
                  backgroundColor: msg.role === 'user' ? colors.accent : colors.surface,
                  borderColor: msg.role === 'user' ? colors.accent : colors.border,
                  borderWidth: msg.role === 'user' ? 0 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: msg.role === 'user' ? colors.background : colors.textPrimary },
                ]}
              >
                {msg.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  { color: msg.role === 'user' ? colors.background : colors.textMuted },
                ]}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          {isTyping && (
            <View
              style={[
                styles.messageBubble,
                styles.assistantBubble,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                🤖 Martin is typing...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplies}>
            {[
              { id: '1', text: 'Draft reply' },
              { id: '2', text: 'Schedule meeting' },
              { id: '3', text: 'Create task' },
              { id: '4', text: 'Summarize inbox' },
            ].map((reply) => (
              <Pressable
                key={reply.id}
                style={[styles.quickReplyPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.quickReplyText, { color: colors.textPrimary }]}>{reply.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Voice Status Indicator */}
        {isListening && (
          <View style={[styles.voiceStatusBar, { backgroundColor: colors.accent }]}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                {
                  transform: [
                    {
                      scale: recordingAmplitude.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                  ],
                  backgroundColor: colors.background,
                },
              ]}
            />
            <Text style={[styles.voiceStatusText, { color: colors.background }]}>
              🎙️ Listening...
            </Text>
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder={
              voiceEnabled
                ? voiceMode === 'voice'
                  ? 'Voice mode active...'
                  : 'Ask Martin anything or tap mic...'
                : 'Ask Martin anything...'
            }
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <View style={styles.inputActions}>
            {voiceEnabled && (
              <Pressable
                onPress={handleVoiceToggle}
                onLongPress={handleVoiceSettings}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: isListening
                      ? colors.danger || '#FF6B6B'
                      : isPlayingAudio
                        ? colors.warning || '#FFB945'
                        : colors.accent
                  }
                ]}
              >
                {isListening ? (
                  <MicOff color={colors.background} size={20} strokeWidth={2.4} />
                ) : isPlayingAudio ? (
                  <Volume2 color={colors.background} size={20} strokeWidth={2.4} />
                ) : (
                  <Mic color={colors.background} size={20} strokeWidth={2.4} />
                )}
              </Pressable>
            )}

            <Pressable
              onPress={() => handleVoiceSettings()}
              style={[styles.iconButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Settings color={colors.textMuted} size={18} strokeWidth={2} />
            </Pressable>

            <Pressable
              style={[styles.iconButton, { backgroundColor: message ? colors.accent : colors.surfaceElevated }]}
              disabled={!message && voiceMode !== 'voice'}
              onPress={handleSendPress}
            >
              <Send
                color={message || voiceMode === 'voice' ? colors.background : colors.textMuted}
                size={20}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    gap: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  quickRepliesContainer: {
    paddingVertical: 12,
  },
  quickReplies: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 12,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  voiceStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
