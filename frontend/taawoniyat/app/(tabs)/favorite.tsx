import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ProductCard, ProductData } from '@/components/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  const { addToCart } = useCart();

  // Get user-specific favorites key
  const getFavoritesKey = () => {
    return user?.id ? `favoriteProducts_${user.id}` : 'favoriteProducts_guest';
  };

  const loadFavoriteProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      console.log('Loading favorite products from AsyncStorage...');
      const favoritesKey = getFavoritesKey();
      const existingFavoritesJson = await AsyncStorage.getItem(favoritesKey);
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
      if (!isAuthenticated || !user) {
        console.log('Cannot save favorites: user not authenticated');
        return;
      }
      console.log('Saving favorite products to AsyncStorage:', favorites);
      const favoritesKey = getFavoritesKey();
      await AsyncStorage.setItem(favoritesKey, JSON.stringify(favorites));
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

  const handleAddToCart = async (product: ProductData) => {
    try {
      await addToCart(product);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add product to cart.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavoriteProducts();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Favorites" showBack={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Favorites" showBack={false} />
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyText}>
            Please log in to view your favorites
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/Account/login')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }



  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Favorites" showBack={false} />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Favorites" showBack={false} />
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyText}>
            No favorite products yet.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Favorites" showBack={false} />
      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {favorites.map((product) => (
            <View key={product.id} style={styles.productWrapper}>
              <ProductCard
                {...product}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
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
  loginButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});