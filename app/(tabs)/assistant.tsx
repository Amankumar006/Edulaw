import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../lib/supabase';
import { constitutionalLawChat, formatLegalResponse, categorizeQuestion } from '../../lib/gemini';
import ChatMessage from '../../components/ChatMessage';
import TypingIndicator from '../../components/TypingIndicator';
import { Send, RefreshCw, Bookmark, Copy, Share2, Info, X, CircleAlert as AlertCircle } from 'lucide-react-native';
import { ChatMessage as ChatMessageType } from '../../types';

export default function AssistantScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [chatHistoryId, setChatHistoryId] = useState<string | null>(null);
  
  // Suggested questions for new users
  const suggestedQuestions = [
    "What are the fundamental rights in the Indian Constitution?",
    "Explain Article 21 of the Constitution",
    "How does the Indian judiciary system work?",
    "What is the process to amend the Constitution?",
  ];
  
  // Load chat history on component mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Load chat history from Supabase
  const loadChatHistory = async () => {
    try {
      // Check if user has an existing chat history
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading chat history:', error);
        return;
      }
      
      if (data) {
        setChatHistoryId(data.id);
        
        // Parse messages and convert timestamps to Date objects
        const parsedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(parsedMessages);
      } else {
        // Create a new chat history
        createNewChatHistory();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  
  // Create a new chat history in Supabase
  const createNewChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user?.id,
          messages: [],
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating chat history:', error);
        return;
      }
      
      setChatHistoryId(data.id);
    } catch (error) {
      console.error('Error creating chat history:', error);
    }
  };
  
  // Update chat history in Supabase
  const updateChatHistory = async (updatedMessages: ChatMessageType[]) => {
    if (!chatHistoryId) return;
    
    try {
      const { error } = await supabase
        .from('chat_history')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatHistoryId);
      
      if (error) {
        console.error('Error updating chat history:', error);
      }
    } catch (error) {
      console.error('Error updating chat history:', error);
    }
  };
  
  // Send message to Gemini API
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Update UI immediately with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setError(null);
    
    // Update chat history in Supabase
    await updateChatHistory(updatedMessages);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Send to Gemini API
    setIsLoading(true);
    
    try {
      const { text, error } = await constitutionalLawChat.sendMessage(userMessage.text);
      
      if (error) {
        setError(error);
        setIsLoading(false);
        return;
      }
      
      // Format the response
      const formattedText = formatLegalResponse(text);
      
      // Categorize the question
      const category = categorizeQuestion(userMessage.text);
      
      // Create assistant message
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString(),
        text: formattedText,
        sender: 'assistant',
        timestamp: new Date(),
        category,
      };
      
      // Update messages
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Update chat history in Supabase
      await updateChatHistory(newMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Reset conversation
  const resetConversation = () => {
    Alert.alert(
      'Reset Conversation',
      'Are you sure you want to clear this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Reset local state
            setMessages([]);
            setError(null);
            
            // Reset Gemini chat
            constitutionalLawChat.resetConversation();
            
            // Create a new chat history
            await createNewChatHistory();
            
            // Show info panel again
            setShowInfoPanel(true);
          },
        },
      ]
    );
  };
  
  // Toggle bookmark for a message
  const toggleBookmark = (messageId: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          bookmarked: !msg.bookmarked,
        };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    updateChatHistory(updatedMessages);
    
    // Show confirmation
    Alert.alert(
      messages.find(m => m.id === messageId)?.bookmarked 
        ? 'Bookmark Removed' 
        : 'Bookmark Added',
      messages.find(m => m.id === messageId)?.bookmarked 
        ? 'Message removed from bookmarks' 
        : 'Message added to bookmarks'
    );
  };
  
  // Copy message text to clipboard
  const copyMessageText = (text: string) => {
    // In a real app, this would use Clipboard.setString(text)
    Alert.alert('Copied to Clipboard', 'Message text copied to clipboard');
  };
  
  // Share message
  const shareMessage = (text: string) => {
    // In a real app, this would use Share.share({ message: text })
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };
  
  // Retry last message
  const retryLastMessage = async () => {
    if (messages.length === 0) return;
    
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.sender === 'user');
    
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];
    
    // Remove all messages after the last user message
    const messagesToKeep = messages.slice(0, messages.length - lastUserMessageIndex);
    setMessages(messagesToKeep);
    
    // Set the input text to the last user message
    setInputText(lastUserMessage.text);
    
    // Update chat history
    await updateChatHistory(messagesToKeep);
  };
  
  // Use a suggested question
  const useSuggestedQuestion = (question: string) => {
    setInputText(question);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Legal Assistant</Text>
        <Text style={styles.subtitle}>Ask questions about Indian Constitutional law</Text>
      </View>
      
      {/* Info Panel */}
      {showInfoPanel && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <Info size={16} color="#3B82F6" />
            <Text style={styles.infoPanelTitle}>About the Legal Assistant</Text>
          </View>
          
          <Text style={styles.infoPanelText}>
            This AI assistant is specialized in Indian Constitutional law and can help you with:
          </Text>
          
          <View style={styles.infoPanelList}>
            <View style={styles.infoPanelListItem}>
              <Text style={styles.infoPanelBullet}>•</Text>
              <Text style={styles.infoPanelText}>Understanding fundamental rights and duties</Text>
            </View>
            <View style={styles.infoPanelListItem}>
              <Text style={styles.infoPanelBullet}>•</Text>
              <Text style={styles.infoPanelText}>Explaining constitutional articles and amendments</Text>
            </View>
            <View style={styles.infoPanelListItem}>
              <Text style={styles.infoPanelBullet}>•</Text>
              <Text style={styles.infoPanelText}>Providing information about landmark cases</Text>
            </View>
            <View style={styles.infoPanelListItem}>
              <Text style={styles.infoPanelBullet}>•</Text>
              <Text style={styles.infoPanelText}>Clarifying legal terminology and concepts</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.infoPanelClose}
            onPress={() => setShowInfoPanel(false)}
          >
            <X size={14} color="#6B7280" />
            <Text style={styles.infoPanelCloseText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length > 0 && (
          <View style={styles.messageActions}>
            <TouchableOpacity 
              style={styles.messageAction}
              onPress={resetConversation}
            >
              <RefreshCw size={14} color="#6B7280" />
              <Text style={styles.messageActionText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {messages.map((message, index) => (
          <View key={message.id}>
            {message.sender === 'assistant' && message.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{message.category}</Text>
              </View>
            )}
            
            <ChatMessage
              text={message.text}
              sender={message.sender}
              timestamp={message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)}
              onLinkPress={(url) => {
                // In a real app, this would open the URL
                Alert.alert('Open URL', `Opening: ${url}`);
              }}
            />
            
            {message.sender === 'assistant' && (
              <View style={styles.messageActions}>
                <TouchableOpacity 
                  style={styles.messageAction}
                  onPress={() => toggleBookmark(message.id)}
                >
                  <Bookmark 
                    size={14} 
                    color={message.bookmarked ? '#3B82F6' : '#6B7280'} 
                    fill={message.bookmarked ? '#3B82F6' : 'transparent'} 
                  />
                  <Text style={styles.messageActionText}>
                    {message.bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.messageAction}
                  onPress={() => copyMessageText(message.text)}
                >
                  <Copy size={14} color="#6B7280" />
                  <Text style={styles.messageActionText}>Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.messageAction}
                  onPress={() => shareMessage(message.text)}
                >
                  <Share2 size={14} color="#6B7280" />
                  <Text style={styles.messageActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        
        {isLoading && <TypingIndicator />}
        
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#EF4444" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryLastMessage}
            >
              <RefreshCw size={14} color="#FFFFFF" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Suggested Questions (only show if no messages) */}
      {messages.length === 0 && !isLoading && (
        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedTitle}>Try asking about:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestedScroll}
          >
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestedQuestion}
                onPress={() => useSuggestedQuestion(question)}
              >
                <Text style={styles.suggestedQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about Indian Constitutional law..."
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoPanel: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  infoPanelText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoPanelList: {
    marginBottom: 8,
  },
  infoPanelListItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  infoPanelBullet: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 8,
  },
  infoPanelClose: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  infoPanelCloseText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageActions: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  messageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  messageActionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  categoryTag: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
    marginBottom: 8,
    marginTop: -4,
  },
  categoryText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  suggestedContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  suggestedScroll: {
    flexDirection: 'row',
  },
  suggestedQuestion: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestedQuestionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});