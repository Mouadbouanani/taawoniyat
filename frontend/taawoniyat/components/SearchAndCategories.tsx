import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

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
        <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Moroccan products..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#8B4513"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
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
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FDF5E6', // Light cream color
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC', // Cornsilk color
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D2B48C', // Tan color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#8B4513', // Saddle brown color
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#FFF8DC', // Cornsilk color
    borderWidth: 1,
    borderColor: '#D2B48C', // Tan color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#8B4513', // Saddle brown color
    borderColor: '#8B4513',
  },
  categoryText: {
    fontSize: 14,
    color: '#8B4513', // Saddle brown color
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFF8DC', // Cornsilk color
  },
});