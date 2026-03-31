import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnalysisResult } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const CARD_BG = '#12121A';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8B8B9E';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachChatProps {
  analysisResult: AnalysisResult;
  onClose?: () => void;
}

// Quick suggestion buttons
const QUICK_SUGGESTIONS = [
  "How do I maintain this fade?",
  "What products should I use?",
  "How do I ask my barber for this style?",
  "When should I get my next cut?",
  "What's causing the uneven areas?",
];

// System prompt for the AI coach
const getSystemPrompt = (result: AnalysisResult) => `You are a friendly, knowledgeable barber coach helping someone understand their haircut analysis. 

THEIR ANALYSIS RESULTS:
- Overall Score: ${result.overall_score}/10 (${result.score_label})
- Scores: ${JSON.stringify(result.scores)}
- Verdict: ${result.verdict}
- Hair Type: ${result.hair_profile?.hair_type_name || 'Unknown'}
- Face Shape: ${result.face_analysis?.face_shape || 'Unknown'}
- Fade Type: ${result.fade_details?.fade_type_name || 'Unknown'}
- Maintenance: ${result.maintenance?.maintenance_schedule || 'Unknown'}
${result.improvement_areas ? `- Areas to improve: ${result.improvement_areas.join(', ')}` : ''}

YOUR ROLE:
- Be friendly, supportive, and helpful
- Give practical, actionable advice
- Reference their specific results when relevant
- Keep responses concise but informative (2-3 paragraphs max)
- Use casual, conversational tone
- If they ask about products, give specific recommendations for their hair type
- If they ask about maintenance, reference their specific fade type

Never be condescending or use overly technical jargon. You're like a friendly barber giving advice.`;

export default function AICoachChat({ analysisResult, onClose }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! 👋 I'm your FadeCheck coach. I've looked at your analysis (${analysisResult.score_label} - ${analysisResult.overall_score?.toFixed(1)}/10). Ask me anything about your haircut, maintenance tips, or what to tell your barber next time!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new message added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: text.trim(),
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using mini for faster, cheaper responses
          messages: [
            { role: 'system', content: getSystemPrompt(analysisResult) },
            ...conversationHistory,
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content;

      if (assistantContent) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that. Try again or ask a different question!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachEmoji}>💈</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>FadeCheck Coach</Text>
            <Text style={styles.headerSubtitle}>AI-powered advice</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.assistantIcon}>
                <Text style={styles.assistantEmoji}>💈</Text>
              </View>
            )}
            <View style={[
              styles.messageContent,
              message.role === 'user' ? styles.userContent : styles.assistantContent,
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' && styles.userText,
              ]}>
                {message.content}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <View style={styles.assistantIcon}>
              <Text style={styles.assistantEmoji}>💈</Text>
            </View>
            <View style={[styles.messageContent, styles.assistantContent]}>
              <ActivityIndicator size="small" color={CYAN_GLOW} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions */}
      {messages.length <= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {QUICK_SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => handleQuickSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your haircut..."
            placeholderTextColor={TEXT_SECONDARY}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={inputText.trim() && !isLoading ? [ACCENT_BLUE, CYAN_GLOW] : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CYAN_GLOW,
  },
  coachEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantEmoji: {
    fontSize: 14,
  },
  messageContent: {
    maxWidth: SCREEN_WIDTH * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userContent: {
    backgroundColor: ACCENT_BLUE,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  assistantContent: {
    backgroundColor: CARD_BG,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  suggestionsContainer: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: CYAN_GLOW,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 15,
    color: TEXT_PRIMARY,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  sendButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
