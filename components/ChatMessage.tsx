import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

interface ChatMessageProps {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  onLinkPress?: (url: string) => void;
}

export default function ChatMessage({ text, sender, timestamp, onLinkPress }: ChatMessageProps) {
  // Function to format the message with markdown-like syntax
  const formatMessage = (message: string) => {
    // Split the message into paragraphs
    const paragraphs = message.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a bullet list
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const listItems = paragraph.split('\n');
        return (
          <View key={`p-${index}`} style={styles.bulletList}>
            {listItems.map((item, itemIndex) => {
              if (item.trim().startsWith('- ') || item.trim().startsWith('* ')) {
                return (
                  <View key={`li-${itemIndex}`} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={[
                      styles.messageText,
                      sender === 'assistant' ? styles.assistantText : styles.userText
                    ]}>
                      {formatTextWithStyles(item.replace(/^[-*]\s/, ''))}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        );
      }
      
      // Check if paragraph is a numbered list
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const listItems = paragraph.split('\n');
        return (
          <View key={`p-${index}`} style={styles.numberedList}>
            {listItems.map((item, itemIndex) => {
              const match = item.trim().match(/^(\d+)\.\s(.*)/);
              if (match) {
                return (
                  <View key={`li-${itemIndex}`} style={styles.numberedItem}>
                    <Text style={styles.number}>{match[1]}.</Text>
                    <Text style={[
                      styles.messageText,
                      sender === 'assistant' ? styles.assistantText : styles.userText
                    ]}>
                      {formatTextWithStyles(match[2])}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        );
      }
      
      // Regular paragraph
      return (
        <Text 
          key={`p-${index}`} 
          style={[
            styles.messageText,
            sender === 'assistant' ? styles.assistantText : styles.userText,
            index > 0 && styles.paragraphSpacing
          ]}
        >
          {formatTextWithStyles(paragraph)}
        </Text>
      );
    });
  };
  
  // Function to format text with bold, italic, and links
  const formatTextWithStyles = (text: string) => {
    // Process the text to handle markdown-like formatting
    const parts = [];
    let lastIndex = 0;
    
    // Bold text (surrounded by **)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (lastIndex < boldMatch.index) {
        parts.push(
          <Text key={`text-${lastIndex}`}>
            {text.substring(lastIndex, boldMatch.index)}
          </Text>
        );
      }
      parts.push(
        <Text key={`bold-${boldMatch.index}`} style={styles.boldText}>
          {boldMatch[1]}
        </Text>
      );
      lastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </Text>
      );
    }
    
    // If no formatting was found, return the original text
    if (parts.length === 0) {
      return text;
    }
    
    return <>{parts}</>;
  };
  
  // Function to detect and make citations clickable
  const detectCitations = (text: string) => {
    // Regex patterns for different types of citations
    const articlePattern = /Article\s+(\d+[A-Z]?(\(\d+\))?)/gi;
    const casePattern = /([A-Za-z]+\s+v\.?\s+[A-Za-z]+)/g;
    
    // Replace article citations with clickable links
    text = text.replace(articlePattern, (match, article) => {
      const url = `https://indiankanoon.org/search/?formInput=article%20${article}%20constitution%20of%20india`;
      return `[${match}](${url})`;
    });
    
    // Replace case citations with clickable links
    text = text.replace(casePattern, (match) => {
      const url = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(match)}`;
      return `[${match}](${url})`;
    });
    
    return text;
  };
  
  // Format the timestamp
  const formattedTime = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <View 
      style={[
        styles.messageBubble,
        sender === 'user' ? styles.userBubble : styles.assistantBubble
      ]}
    >
      {formatMessage(text)}
      <Text style={styles.timestamp}>{formattedTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#EBF5FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#1F2937',
  },
  assistantText: {
    color: '#1F2937',
  },
  boldText: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  paragraphSpacing: {
    marginTop: 8,
  },
  bulletList: {
    marginVertical: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
    lineHeight: 22,
    color: '#3B82F6',
  },
  numberedList: {
    marginVertical: 4,
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  number: {
    marginRight: 8,
    fontSize: 16,
    lineHeight: 22,
    color: '#3B82F6',
    minWidth: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  linkIcon: {
    marginLeft: 4,
  },
});