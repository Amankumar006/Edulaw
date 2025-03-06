import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../components/AuthContext';
import { BookOpen, ChevronRight, Award } from 'lucide-react-native';

interface Module {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  sequence_number: number;
  module_id: string;
}

interface Progress {
  completed_lessons: string[];
  quiz_scores: Record<string, number>;
  completion_percentage: number;
}

export default function LearnScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadModules = async () => {
    try {
      // Fetch modules with their chapters
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          chapters (
            id,
            title,
            sequence_number
          )
        `)
        .eq('published_status', 'published')
        .order('created_at', { ascending: false });
      
      if (modulesError) throw modulesError;
      
      setModules(modulesData);
      
      // Fetch progress for all modules
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) throw progressError;
        
        const progressMap: Record<string, Progress> = {};
        progressData?.forEach(item => {
          progressMap[item.module_id] = {
            completed_lessons: item.completed_lessons || [],
            quiz_scores: item.quiz_scores || {},
            completion_percentage: item.completion_percentage || 0,
          };
        });
        
        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setError('Failed to load learning modules');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadModules();
  }, [user]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadModules();
    setRefreshing(false);
  }, []);
  
  const renderModuleHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Learning Modules</Text>
      <Text style={styles.subtitle}>Master Constitutional Law step by step</Text>
    </View>
  );
  
  const renderModule = ({ item: module }: { item: Module }) => {
    const moduleProgress = progress[module.id] || {
      completed_lessons: [],
      quiz_scores: {},
      completion_percentage: 0,
    };
    
    const totalChapters = module.chapters?.length || 0;
    const completedChapters = moduleProgress.completed_lessons.length;
    const progressPercentage = totalChapters > 0 
      ? (completedChapters / totalChapters) * 100 
      : 0;
    
    return (
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => {
          const firstIncompleteChapter = module.chapters.find(
            chapter => !moduleProgress.completed_lessons.includes(chapter.id)
          );
          
          if (firstIncompleteChapter) {
            router.push(`/learn/chapter/${firstIncompleteChapter.id}`);
          } else if (module.chapters.length > 0) {
            router.push(`/learn/chapter/${module.chapters[0].id}`);
          }
        }}
      >
        <Image 
          source={{ uri: module.image_url }} 
          style={styles.moduleImage}
        />
        
        <View style={styles.moduleContent}>
          <View style={styles.moduleHeader}>
            <View style={styles.badgeContainer}>
              <Text style={styles.categoryBadge}>{module.category}</Text>
              <Text style={styles.difficultyBadge}>
                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
              </Text>
            </View>
            
            <Text style={styles.estimatedTime}>
              {module.estimated_time_minutes} min
            </Text>
          </View>
          
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleDescription} numberOfLines={2}>
            {module.description}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            
            <View style={styles.progressStats}>
              <Text style={styles.progressText}>
                {completedChapters}/{totalChapters} Chapters
              </Text>
              
              {moduleProgress.completion_percentage === 100 && (
                <Award size={16} color="#10B981" />
              )}
            </View>
          </View>
          
          <View style={styles.chapterList}>
            {module.chapters.slice(0, 3).map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id}
                style={styles.chapterItem}
                onPress={() => router.push(`/learn/chapter/${chapter.id}`)}
              >
                <View style={styles.chapterInfo}>
                  <BookOpen size={16} color="#6B7280" />
                  <Text style={styles.chapterTitle} numberOfLines={1}>
                    {chapter.title}
                  </Text>
                </View>
                
                {moduleProgress.completed_lessons.includes(chapter.id) ? (
                  <Award size={16} color="#10B981" />
                ) : (
                  <ChevronRight size={16} color="#6B7280" />
                )}
              </TouchableOpacity>
            ))}
            
            {module.chapters.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {module.chapters.length} chapters
                </Text>
                <ChevronRight size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={modules}
      renderItem={renderModule}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderModuleHeader}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
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
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleImage: {
    width: '100%',
    height: 160,
  },
  moduleContent: {
    padding: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    backgroundColor: '#EBF5FF',
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyBadge: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  chapterList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  chapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterTitle: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginRight: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});