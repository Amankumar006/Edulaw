import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Award, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react-native';

export default function ChallengesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');
  
  // Mock data for challenges
  const dailyChallenges = [
    {
      id: '1',
      title: 'Article 14 Quiz',
      description: 'Test your knowledge on equality before law',
      points: 50,
      difficulty: 'easy',
      completed: false,
      module_id: '1',
      time_limit_minutes: 5,
      questions_count: 5,
    },
    {
      id: '2',
      title: 'Constitutional Amendment Process',
      description: 'Challenge yourself on the amendment procedures',
      points: 75,
      difficulty: 'medium',
      completed: false,
      module_id: '3',
      time_limit_minutes: 8,
      questions_count: 8,
    },
    {
      id: '3',
      title: 'Fundamental Rights Case Study',
      description: 'Analyze a real-world case related to fundamental rights',
      points: 100,
      difficulty: 'hard',
      completed: false,
      module_id: '1',
      time_limit_minutes: 15,
      questions_count: 3,
    },
  ];
  
  const weeklyChallenge = {
    id: 'w1',
    title: 'Constitutional Debate: Uniform Civil Code',
    description: 'Participate in a debate on the implementation of a Uniform Civil Code in India',
    points: 200,
    ends_in_days: 3,
    participants: 124,
    image_url: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
  };
  
  const achievements = [
    {
      id: 'a1',
      title: 'Constitution Novice',
      description: 'Complete 5 beginner modules',
      icon: '🔰',
      unlocked: true,
      progress: 100,
    },
    {
      id: 'a2',
      title: 'Rights Defender',
      description: 'Score 90% or higher on all Fundamental Rights quizzes',
      icon: '🛡️',
      unlocked: false,
      progress: 60,
    },
    {
      id: 'a3',
      title: 'Legal Eagle',
      description: 'Win 3 constitutional debates',
      icon: '🦅',
      unlocked: false,
      progress: 33,
    },
    {
      id: 'a4',
      title: 'Perfect Streak',
      description: 'Maintain a 30-day learning streak',
      icon: '🔥',
      unlocked: false,
      progress: 16,
    },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <>
            <View style={styles.weeklyContainer}>
              <Image 
                source={{ uri: weeklyChallenge.image_url }} 
                style={styles.weeklyImage}
              />
              <View style={styles.weeklyOverlay}>
                <View style={styles.weeklyContent}>
                  <View style={styles.weeklyBadge}>
                    <Text style={styles.weeklyBadgeText}>Weekly Challenge</Text>
                  </View>
                  <Text style={styles.weeklyTitle}>{weeklyChallenge.title}</Text>
                  <Text style={styles.weeklyDescription}>{weeklyChallenge.description}</Text>
                  <View style={styles.weeklyFooter}>
                    <View style={styles.weeklyStats}>
                      <Text style={styles.weeklyPoints}>{weeklyChallenge.points} points</Text>
                      <Text style={styles.weeklyTimeLeft}>Ends in {weeklyChallenge.ends_in_days} days</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.weeklyButton}
                      onPress={() => router.push(`/challenges/${weeklyChallenge.id}`)}
                    >
                      <Text style={styles.weeklyButtonText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Today's Challenges</Text>
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
                  <View style={styles.challengeDetails}>
                    <View style={styles.challengeDetail}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.challengeDetailText}>{challenge.time_limit_minutes} min</Text>
                    </View>
                    <View style={styles.challengeDetail}>
                      <Award size={14} color="#6B7280" />
                      <Text style={styles.challengeDetailText}>{challenge.points} points</Text>
                    </View>
                    <View style={styles.challengeDetail}>
                      <Text style={styles.challengeDetailText}>{challenge.questions_count} questions</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" style={styles.challengeArrow} />
              </TouchableOpacity>
            ))}
          </>
        );
      case 'achievements':
        return (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>450</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4/16</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            {achievements.map(achievement => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${achievement.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{achievement.progress}%</Text>
                  </View>
                </View>
                {achievement.unlocked ? (
                  <CheckCircle size={24} color="#10B981" style={styles.achievementStatus} />
                ) : (
                  <XCircle size={24} color="#9CA3AF" style={styles.achievementStatus} />
                )}
              </View>
            ))}
          </>
        );
      case 'leaderboard':
        return (
          <View style={styles.comingSoonContainer}>
            <Award size={64} color="#D1D5DB" />
            <Text style={styles.comingSoonTitle}>Leaderboard Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              Compete with other learners and see who knows the Constitution best!
            </Text>
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Challenges & Achievements</Text>
        <Text style={styles.subtitle}>Test your knowledge and earn rewards</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Achievements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>
    </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 8,
  },
  weeklyContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  weeklyImage: {
    width: '100%',
    height: '100%',
  },
  weeklyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  weeklyContent: {
    padding: 16,
  },
  weeklyBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  weeklyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  weeklyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weeklyDescription: {
    fontSize: 14,
    color: '#F3F4F6',
    marginBottom: 16,
  },
  weeklyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyStats: {
    flex: 1,
  },
  weeklyPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  weeklyTimeLeft: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  weeklyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weeklyButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  challengeContent: {
    flex: 1,
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
  challengeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  challengeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  challengeArrow: {
    marginRight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  achievementStatus: {
    marginLeft: 12,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
});