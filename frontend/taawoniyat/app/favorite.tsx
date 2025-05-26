import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { ProductCard, ProductData } from '@/components/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavoriteProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading favorite products from AsyncStorage...');
      const existingFavoritesJson = await AsyncStorage.getItem('favoriteProducts');
      const favorites: ProductData[] = existingFavoritesJson ? JSON.parse(existingFavoritesJson) : [];
      console.log('Loaded favorite products:', favorites);
      setFavorites(favorites);
    } catch (error: any) {
      console.error('Error loading favorite products from AsyncStorage:', error);
      setError(error.message || 'Failed to load favorite products.');
      Alert.alert('Error', error.message || 'Failed to load favorite products.');
    } finally {
      setLoading(false);
    }
  };

  const saveFavoriteProducts = async (favorites: ProductData[]) => {
    try {
      console.log('Saving favorite products to AsyncStorage:', favorites);
      await AsyncStorage.setItem('favoriteProducts', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorite products to AsyncStorage:', error);
      Alert.alert('Error', 'Failed to save favorite products.');
    }
  };

  const handleToggleFavorite = async (productToToggle: ProductData) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== productToToggle.id);
    setFavorites(updatedFavorites);
    await saveFavoriteProducts(updatedFavorites);
    Alert.alert('Removed from Favorites', `${productToToggle.name} has been removed from your favorites.`);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavoriteProducts();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color="#666" />
        <ThemedText style={styles.emptyText}>
          No favorite products yet.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {favorites.map((product) => (
          <View key={product.id} style={styles.productWrapper}>
            <ProductCard
              {...product}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={() => {
                Alert.alert('Add to Cart', 'Navigate to product page to add this item to cart.');
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#666',
  },
});