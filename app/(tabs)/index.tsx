import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import Card from '../../components/Card';
import { Bell, ChevronRight, BookOpen, Award, BarChart2 } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for the home screen
  const featuredModules = [
    {
      id: '1',
      title: 'Fundamental Rights in the Indian Constitution',
      description: 'Learn about the six fundamental rights guaranteed by the Indian Constitution.',
      category: 'Constitutional Law',
      difficulty: 'beginner',
      estimated_time_minutes: 25,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
    {
      id: '2',
      title: 'Directive Principles of State Policy',
      description: 'Understand the guiding principles that are fundamental in the governance of India.',
      category: 'Constitutional Law',
      difficulty: 'intermediate',
      estimated_time_minutes: 30,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
  ];
  
  const dailyChallenges = [
    {
      id: '1',
      title: 'Article 14 Quiz',
      description: 'Test your knowledge on equality before law',
      points: 50,
      difficulty: 'easy',
      completed: false,
      module_id: '1',
    },
    {
      id: '2',
      title: 'Constitutional Amendment Process',
      description: 'Challenge yourself on the amendment procedures',
      points: 75,
      difficulty: 'medium',
      completed: false,
      module_id: '3',
    },
  ];
  
  const streakData = {
    current: 5,
    longest: 12,
    today_completed: false,
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.username || 'Learner'}</Text>
          <Text style={styles.subtitle}>Continue your constitutional journey</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>
      
      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>Your Learning Streak</Text>
          <Text style={styles.streakCount}>{streakData.current} days</Text>
          <Text style={styles.streakSubtext}>Longest: {streakData.longest} days</Text>
        </View>
        <View style={styles.streakVisual}>
          <BarChart2 size={48} color="#3B82F6" />
          {!streakData.today_completed && (
            <TouchableOpacity style={styles.streakButton}>
              <Text style={styles.streakButtonText}>Complete Today</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Continue Learning */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => router.push('/learn')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {featuredModules.map(module => (
          <Card
            key={module.id}
            title={module.title}
            description={module.description}
            imageUrl={module.image_url}
            badge={module.category}
            progress={module.completion_percentage}
            onPress={() => router.push(`/learn/${module.id}`)}
          />
        ))}
      </View>
      
      {/* Daily Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <TouchableOpacity onPress={() => router.push('/challenges')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {dailyChallenges.map(challenge => (
          <TouchableOpacity 
            key={challenge.id} 
            style={styles.challengeCard}
            onPress={() => router.push(`/challenges/${challenge.id}`)}
          >
            <View style={styles.challengeContent}>
              <View style={[
                styles.difficultyBadge, 
                challenge.difficulty === 'easy' ? styles.easyBadge : 
                challenge.difficulty === 'medium' ? styles.mediumBadge : 
                styles.hardBadge
              ]}>
                <Text style={styles.difficultyText}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </Text>
              </View>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeFooter}>
                <View style={styles.pointsContainer}>
                  <Award size={16} color="#3B82F6" />
                  <Text style={styles.pointsText}>{challenge.points} points</Text>
                </View>
                <ChevronRight size={16} color="#6B7280" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/learn')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#EBF5FF' }]}>
              <BookOpen size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickAccessText}>Learning Modules</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/challenges')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#FEF3C7' }]}>
              <Award size={24} color="#D97706" />
            </View>
            <Text style={styles.quickAccessText}>Challenges</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/assistant')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#DCFCE7' }]}>
              <Bell size={24} color="#10B981" />
            </View>
            <Text style={styles.quickAccessText}>AI Assistant</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#F3E8FF' }]}>
              <BarChart2 size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.quickAccessText}>Progress Stats</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakVisual: {
    alignItems: 'center',
  },
  streakButton: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  streakButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  challengeContent: {
    padding: 16,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  easyBadge: {
    backgroundColor: '#DCFCE7',
  },
  mediumBadge: {
    backgroundColor: '#FEF3C7',
  },
  hardBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -8,
  },
  quickAccessItem: {
    width: '50%',
    padding: 8,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
});