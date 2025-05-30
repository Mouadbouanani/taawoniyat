import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from './ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/theme/designSystem';

interface SearchAndCategoriesProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

export function SearchAndCategories({ onSearch, onCategorySelect }: SearchAndCategoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/store/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: string[] = await response.json();
      console.log('Fetched categories:', data);

      // Add "All" category at the beginning if it's not already there
      const categoriesWithAll = data.includes('All') ? data : ['All', ...data];
      setCategories(categoriesWithAll);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock categories if API fails
      setCategories([
        'All',
        'Oils',
        'Spices',
        'Beauty',
        'Teas',
        'Honey',
        'Herbs',
      ]);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={designSystem.colors.primary[600]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Moroccan products..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={designSystem.colors.neutral[500]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={`${category}-${index}`}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Typography
              variant="body2"
              color={selectedCategory === category ? '#FFFFFF' : designSystem.colors.primary[600]}
              style={styles.categoryText}
            >
              {category}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: designSystem.spacing.md,
    backgroundColor: designSystem.colors.neutral[50],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: designSystem.borderRadius.lg,
    paddingHorizontal: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
    borderWidth: 1,
    borderColor: designSystem.colors.primary[200],
    ...designSystem.shadows.md,
  },
  searchIcon: {
    marginRight: designSystem.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: designSystem.typography.sizes.base,
    color: designSystem.colors.neutral[700],
    fontWeight: designSystem.typography.weights.regular,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoriesContent: {
    paddingRight: designSystem.spacing.md,
  },
  categoryButton: {
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.sm + 4,
    marginRight: designSystem.spacing.sm + 2,
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: designSystem.colors.primary[300],
    ...designSystem.shadows.sm,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: designSystem.colors.primary[500],
    borderColor: designSystem.colors.primary[500],
    ...designSystem.shadows.md,
  },
  categoryText: {
    fontWeight: designSystem.typography.weights.medium,
  },
});