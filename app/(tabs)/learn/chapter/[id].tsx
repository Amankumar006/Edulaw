import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../components/AuthContext';
import { ChevronRight } from 'lucide-react-native';

interface Chapter {
  id: string;
  title: string;
  content: string;
  sequence_number: number;
  module_id: string;
}

export default function ChapterScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    loadChapter();
    loadProgress();
  }, [id]);
  
  const loadChapter = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setChapter(data);
    } catch (error) {
      console.error('Error loading chapter:', error);
      setError('Failed to load chapter content');
    } finally {
      setLoading(false);
    }
  };
  
  const loadProgress = async () => {
    if (!user || !chapter?.module_id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('completed_lessons')
        .eq('user_id', user.id)
        .eq('module_id', chapter.module_id)
        .single();
      
      if (error) throw error;
      
      if (data?.completed_lessons?.includes(id)) {
        setProgress(100);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };
  
  const markAsComplete = async () => {
    if (!user || !chapter?.module_id) return;
    
    try {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('completed_lessons')
        .eq('user_id', user.id)
        .eq('module_id', chapter.module_id)
        .single();
      
      const completedLessons = existingProgress?.completed_lessons || [];
      
      if (!completedLessons.includes(id)) {
        completedLessons.push(id);
      }
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: chapter.module_id,
          completed_lessons: completedLessons,
          last_accessed: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setProgress(100);
      router.push(`/learn/quiz/${id}`);
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  if (error || !chapter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Chapter not found'}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.chapterContent}>{chapter.content}</Text>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={markAsComplete}
        >
          <Text style={styles.nextButtonText}>
            {progress === 100 ? 'Take Quiz' : 'Mark as Complete'}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  chapterContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});