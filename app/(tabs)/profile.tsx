import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import Button from '../../components/Button';
import { User, LogOut, Settings, Bell, Globe, Moon, ChevronRight, Award, BookOpen, HelpCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    username?: string;
    avatar_url?: string;
    interests?: string[];
    learning_preferences?: {
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      daily_goal_minutes: number;
      notification_enabled: boolean;
    };
  }>({});
  const [stats, setStats] = useState({
    modules_completed: 0,
    challenges_completed: 0,
    streak_days: 0,
    total_points: 0,
  });
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userProfile?.learning_preferences?.notification_enabled || false
  );
  
  // Language settings
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'];
  const [showLanguages, setShowLanguages] = useState(false);
  
  // Dark mode setting
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setUserProfile(data);
        setNotificationsEnabled(data.learning_preferences?.notification_enabled || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      // This would be replaced with actual API calls to get user stats
      // For now, we'll use mock data
      setStats({
        modules_completed: 3,
        challenges_completed: 7,
        streak_days: 5,
        total_points: 450,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error signing out', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    try {
      const updatedPreferences = {
        ...userProfile.learning_preferences,
        notification_enabled: value,
      };
      
      await supabase
        .from('profiles')
        .update({
          learning_preferences: updatedPreferences,
        })
        .eq('id', user?.id);
      
      setUserProfile({
        ...userProfile,
        learning_preferences: updatedPreferences,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert the switch if the update fails
      setNotificationsEnabled(!value);
    }
  };
  
  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    // In a real app, this would update the app's theme
  };
  
  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLanguages(false);
    // In a real app, this would update the app's language
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            {userProfile.avatar_url ? (
              <Image 
                source={{ uri: userProfile.avatar_url }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#6B7280" />
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userProfile.username || user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.modules_completed}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.challenges_completed}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
        
        {/* Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/achievements')}
          >
            <Award size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Achievements</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/bookmarks')}
          >
            <BookOpen size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Bookmarks</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/learning-preferences')}
          >
            <Settings size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Learning Preferences</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.menuItem}>
            <Bell size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={notificationsEnabled ? '#3B82F6' : '#9CA3AF'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowLanguages(!showLanguages)}
          >
            <Globe size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Language</Text>
            <View style={styles.menuValueContainer}>
              <Text style={styles.menuValue}>{language}</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          
          {showLanguages && (
            <View style={styles.languageOptions}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    language === lang && styles.selectedLanguageOption
                  ]}
                  onPress={() => selectLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === lang && styles.selectedLanguageOptionText
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.menuItem}>
            <Moon size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={darkMode ? '#3B82F6' : '#9CA3AF'}
            />
          </View>
        </View>
        
        {/* Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/help')}
          >
            <HelpCircle size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>Help Center</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <Info size={20} color="#3B82F6" style={styles.menuIcon} />
            <Text style={styles.menuText}>About Edu-Law</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          loading={loading}
          variant="outline"
          style={styles.signOutButton}
        />
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF5FF',
    borderRadius: 16,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  menuValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  languageOptions: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  languageOption: {
    paddingVertical: 8,
    borderRadius: 4,
  },
  selectedLanguageOption: {
    backgroundColor: '#EBF5FF',
  },
  languageOptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedLanguageOptionText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 24,
  },
});

function Info(props: { size: number; color: string; style: any }) {
  return <HelpCircle {...props} />;
}