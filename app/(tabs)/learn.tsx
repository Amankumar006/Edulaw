import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../../components/Card';
import { Search, Filter, BookOpen, ChevronDown } from 'lucide-react-native';

export default function LearnScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock data for learning modules
  const modules = [
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
    {
      id: '3',
      title: 'Constitutional History of India',
      description: 'Explore the historical development of the Indian Constitution from its inception.',
      category: 'History',
      difficulty: 'beginner',
      estimated_time_minutes: 40,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
    {
      id: '4',
      title: 'Fundamental Duties',
      description: 'Learn about the duties of citizens as outlined in the Indian Constitution.',
      category: 'Constitutional Law',
      difficulty: 'beginner',
      estimated_time_minutes: 20,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
    {
      id: '5',
      title: 'Indian Judiciary System',
      description: 'Understand the structure and functioning of the Indian judicial system.',
      category: 'Judiciary',
      difficulty: 'intermediate',
      estimated_time_minutes: 35,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
    {
      id: '6',
      title: 'Parliament and Legislative Process',
      description: 'Learn about the structure and functioning of the Indian Parliament.',
      category: 'Legislature',
      difficulty: 'advanced',
      estimated_time_minutes: 45,
      completion_percentage: 0,
      image_url: 'https://images.unsplash.com/photo-1592431913823-7af6b323da6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    },
  ];
  
  const categories = [...new Set(modules.map(module => module.category))];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  
  const filteredModules = modules.filter(module => {
    const matchesSearch = searchQuery === '' || 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || module.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === null || module.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learning Modules</Text>
        <Text style={styles.subtitle}>Explore constitutional topics</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Filter size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.selectedFilterChip
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === category && styles.selectedFilterChipText
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Difficulty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {difficulties.map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty && styles.selectedFilterChip
                  ]}
                  onPress={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDifficulty === difficulty && styles.selectedFilterChipText
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Module Categories */}
      <ScrollView style={styles.modulesContainer}>
        {filteredModules.length > 0 ? (
          filteredModules.map(module => (
            <Card
              key={module.id}
              title={module.title}
              description={module.description}
              imageUrl={module.image_url}
              badge={`${module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)} • ${module.estimated_time_minutes} min`}
              progress={module.completion_percentage}
              onPress={() => router.push(`/learn/${module.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No modules found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedFilterChipText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modulesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});