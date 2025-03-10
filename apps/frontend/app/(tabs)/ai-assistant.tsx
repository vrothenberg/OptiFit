import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

// Mock data for AI suggestions
const AI_SUGGESTIONS = [
  "Log my breakfast",
  "Track my morning run",
  "What's my circadian score?",
  "Recommend a meal for dinner",
  "When should I exercise today?",
];

// Mock data for initial messages
const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Hi there! I'm your OptiFit AI assistant. I can help you log meals and workouts, answer questions about your circadian rhythm, and provide personalized recommendations. How can I help you today?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: generateAIResponse(inputText.trim()),
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Handle suggestion press
  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };
  
  // Generate a mock AI response based on user input
  const generateAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('breakfast') || lowerInput.includes('lunch') || lowerInput.includes('dinner')) {
      return "I can help you log your meal. What did you eat? Please provide the food items and approximate quantities.";
    }
    
    if (lowerInput.includes('run') || lowerInput.includes('exercise') || lowerInput.includes('workout')) {
      return "I'd be happy to log your workout. Could you tell me what type of exercise you did, for how long, and at what intensity?";
    }
    
    if (lowerInput.includes('circadian') || lowerInput.includes('score')) {
      return "Your current circadian score is 78/100, which is good! Your sleep schedule has been consistent, but your last meal yesterday was a bit late (9:30 PM). Try to finish eating at least 3 hours before bedtime for optimal circadian health.";
    }
    
    if (lowerInput.includes('recommend') || lowerInput.includes('suggestion')) {
      return "Based on your circadian profile, I recommend having dinner between 6:00-7:30 PM today. A balanced meal with lean protein, complex carbs, and vegetables would be ideal. Would you like some specific recipe suggestions?";
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! How can I help you with your health and circadian rhythm optimization today?";
    }
    
    return "I understand you're asking about " + userInput + ". Could you provide more details so I can better assist you with your circadian health goals?";
  };
  
  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        renderItem={({ item }) => (
          <View 
            style={[
              styles.messageContainer,
              item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer
            ]}
          >
            {item.sender === 'ai' && (
              <View style={styles.avatarContainer}>
                <FontAwesome name="comment" size={20} color={Theme.COLORS.WHITE} />
              </View>
            )}
            <View 
              style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble
              ]}
            >
              <Text 
                style={[
                  styles.messageText,
                  item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                ]}
              >
                {item.text}
              </Text>
              <Text 
                style={[
                  styles.messageTimestamp,
                  item.sender === 'user' ? styles.userMessageTimestamp : styles.aiMessageTimestamp
                ]}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>
            {item.sender === 'user' && (
              <View style={styles.avatarContainer}>
                <FontAwesome name="user" size={20} color={Theme.COLORS.WHITE} />
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.avatarContainer}>
                <FontAwesome name="comment" size={20} color={Theme.COLORS.WHITE} />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotMiddle]} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          ) : null
        }
      />
      
      <View style={styles.suggestionsContainer}>
        <FlatList
          data={AI_SUGGESTIONS}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <FontAwesome 
            name="send" 
            size={20} 
            color={inputText.trim() ? Theme.COLORS.WHITE : '#a0a0a0'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userMessageBubble: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderBottomRightRadius: 5,
  },
  aiMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  userMessageText: {
    color: Theme.COLORS.WHITE,
  },
  aiMessageText: {
    color: Theme.COLORS.DEFAULT,
  },
  messageTimestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  userMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTimestamp: {
    color: Theme.COLORS.MUTED,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.COLORS.MUTED,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  suggestionsContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  suggestionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  suggestionText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});
