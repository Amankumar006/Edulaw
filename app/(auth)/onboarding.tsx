import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import Button from '../../components/Button';

const INTERESTS = [
  'Constitutional Rights',
  'Criminal Law',
  'Civil Rights',
  'Family Law',
  'Property Law',
  'Consumer Protection',
  'Employment Law',
  'Environmental Law',
  'Intellectual Property',
  'Tax Law',
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to legal concepts' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some legal knowledge' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced with legal concepts' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [loading, setLoading] = useState(false);
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  const handleComplete = async () => {
    setLoading(true);
    
    try {
      await updateProfile({
        interests: selectedInterests,
        learning_preferences: {
          difficulty,
          daily_goal_minutes: dailyGoal,
          notification_enabled: true,
        },
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalize Your Experience</Text>
        <Text style={styles.subtitle}>Help us tailor your learning journey</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Interests</Text>
        <Text style={styles.sectionSubtitle}>Choose at least 3 areas of law you're interested in</Text>
        
        <View style={styles.interestsContainer}>
          {INTERESTS.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                selectedInterests.includes(interest) && styles.selectedInterestChip,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.selectedInterestText,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Difficulty Level</Text>
        
        {DIFFICULTY_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.difficultyOption,
              difficulty === level.id && styles.selectedDifficultyOption,
            ]}
            onPress={() => setDifficulty(level.id as 'beginner' | 'intermediate' | 'advanced')}
          >
            <View style={styles.difficultyHeader}>
              <Text
                style={[
                  styles.difficultyLabel,
                  difficulty === level.id && styles.selectedDifficultyLabel,
                ]}
              >
                {level.label}
              </Text>
              {difficulty === level.id && (
                <View style={styles.checkmark} />
              )}
            </View>
            <Text
              style={[
                styles.difficultyDescription,
                difficulty === level.id && styles.selectedDifficultyDescription,
              ]}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Your Daily Goal</Text>
        <Text style={styles.sectionSubtitle}>How many minutes per day do you want to learn?</Text>
        
        <View style={styles.goalOptions}>
          {[15, 30, 45, 60].map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.goalOption,
                dailyGoal === minutes && styles.selectedGoalOption,
              ]}
              onPress={() => setDailyGoal(minutes)}
            >
              <Text
                style={[
                  styles.goalText,
                  dailyGoal === minutes && styles.selectedGoalText,
                ]}
              >
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Button
        title="Complete Setup"
        onPress={handleComplete}
        loading={loading}
        style={styles.completeButton}
        disabled={selectedInterests.length < 3}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  selectedInterestChip: {
    backgroundColor: '#EBF5FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  interestText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedInterestText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  difficultyOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedDifficultyOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF5FF',
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDifficultyLabel: {
    color: '#3B82F6',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedDifficultyDescription: {
    color: '#4B5563',
  },
  goalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedGoalOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF5FF',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  selectedGoalText: {
    color: '#3B82F6',
  },
  completeButton: {
    marginTop: 16,
  },
});