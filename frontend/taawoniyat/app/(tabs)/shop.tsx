import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ProductCard, ProductData } from '@/components/ProductCard';
import { SearchAndCategories } from '@/components/SearchAndCategories';
// import { Product, mockProducts } from '@/data/mockProducts'; // Remove mock data import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Define Product interface based on backend structure (if needed, review authService.ts)
// Moved Product interface definition to ProductCard.tsx and renamed to ProductData
// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   images: string[]; // Updated to match backend - array of strings
//   category: string;
//   quantity: number; // Updated to match backend - 'quantity' for stock
//   sellerFullName: string; // Added sellerFullName as per backend response
//   // Removed sellerId as it's not in the /store/products response
// }

// Remove mock data flag
// const USE_MOCK_DATA = true;

export default function ShopScreen() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<ProductData[]>([]);

  // Function to load favorite products from AsyncStorage
  const loadFavoriteProducts = async () => {
    try {
      console.log('Loading favorite products from AsyncStorage...');
      const existingFavoritesJson = await AsyncStorage.getItem('favoriteProducts');
      const favorites: ProductData[] = existingFavoritesJson ? JSON.parse(existingFavoritesJson) : [];
      console.log('Loaded favorite products:', favorites);
      setFavoriteProducts(favorites);
    } catch (error) {
      console.error('Error loading favorite products from AsyncStorage:', error);
    }
  };

  // Function to save favorite products to AsyncStorage
  const saveFavoriteProducts = async (favorites: ProductData[]) => {
    try {
      console.log('Saving favorite products to AsyncStorage:', favorites);
      await AsyncStorage.setItem('favoriteProducts', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorite products to AsyncStorage:', error);
    }
  };

  // Function to toggle favorite status
  const handleToggleFavorite = async (productToToggle: ProductData) => {
    let updatedFavorites: ProductData[];
    const isCurrentlyFavorite = favoriteProducts.some(fav => fav.id === productToToggle.id);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      updatedFavorites = favoriteProducts.filter(fav => fav.id !== productToToggle.id);
      Alert.alert('Removed from Favorites', `${productToToggle.name} has been removed from your favorites.`);
    } else {
      // Add to favorites
      updatedFavorites = [...favoriteProducts, productToToggle];
      Alert.alert('Added to Favorites', `${productToToggle.name} has been added to your favorites.`);
    }

    setFavoriteProducts(updatedFavorites);
    await saveFavoriteProducts(updatedFavorites);

    // Update the filtered products list to reflect the change immediately
    setFilteredProducts(currentFiltered =>
      currentFiltered.map(product =>
        product.id === productToToggle.id ? { ...product, isFavorite: !isCurrentlyFavorite } as ProductData : product
      )
    );
  };

  useEffect(() => {
    fetchProducts();
    loadFavoriteProducts();
  }, []);

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      console.log('Fetching products from: http://localhost:8080/store/products'); // Log before fetch
      // Fetch from backend API
      const response = await fetch('http://localhost:8080/store/products');

      console.log('Received response. Status:', response.status, 'OK:', response.ok); // Log after fetch

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText); // Log error response body
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('Response is OK, parsing JSON...'); // Log before parsing
      const data: ProductData[] = await response.json();
      console.log('JSON parsed successfully. Data received:', data.length, 'items'); // Log after parsing

      // Log the structure of the first product to debug
      if (data.length > 0) {
        console.log('First product structure:', JSON.stringify(data[0], null, 2));
        console.log('First product category:', data[0]?.category);
        console.log('First product category type:', typeof data[0]?.category);
      }

      setProducts(data);
      setFilteredProducts(data);
    } catch (error: any) {
      console.error('Detailed fetch error:', error); // Log the caught error with more context
      setError(error.message || 'An error occurred while fetching products');
      Alert.alert('Error', error.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(false); // Don't show full screen loader on refresh
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(product => {
      // Add safety checks for null/undefined values
      const productName = product?.name ?? '';
      const productDescription = product?.description ?? '';
      const searchQuery = query.toLowerCase();

      return productName.toLowerCase().includes(searchQuery) ||
             productDescription.toLowerCase().includes(searchQuery);
    });
    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category);
    console.log('Available products:', products.length);

    if (category === 'All') {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      // Add comprehensive safety checks
      if (!product) {
        console.warn('Found null/undefined product in products array');
        return false;
      }

      // Use a default empty string if product.category is null/undefined
      const productCategory = product?.category ?? '';
      const categoryLower = category.toLowerCase();
      const productCategoryLower = productCategory.toLowerCase();

      console.log(`Comparing product category "${productCategory}" with selected "${category}"`);

      return productCategoryLower === categoryLower;
    });

    console.log(`Filtered ${filtered.length} products for category "${category}"`);
    setFilteredProducts(filtered);
  };

  // Function to handle adding products to the cart (using AsyncStorage)
  const handleAddToCart = async (productToAdd: ProductData) => {
    try {
      // Get current cart items from AsyncStorage
      const existingCartJson = await AsyncStorage.getItem('cartItems');
      let cartItems: (ProductData & { cartQuantity: number })[] = existingCartJson
        ? JSON.parse(existingCartJson)
        : [];

      // Check if the product is already in the cart
      const existingItemIndex = cartItems.findIndex(item => item.id === productToAdd.id);

      if (existingItemIndex > -1) {
        // If item exists, increase quantity
        cartItems[existingItemIndex].cartQuantity += 1;
      } else {
        // If item doesn't exist, add it with quantity 1
        cartItems.push({ ...productToAdd, cartQuantity: 1 });
      }

      // Save updated cart items back to AsyncStorage
      await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));

      Alert.alert('Success', `${productToAdd.name} added to cart!`);
      console.log(`Product ${productToAdd.name} added to cart. Current cart:`, cartItems);

    } catch (error: any) {
      console.error('Error adding product to cart to AsyncStorage:', error);
      Alert.alert('Error', 'Failed to add product to cart.');
    }
  };

  // Update filtered products when products or favoriteProducts state changes
  useEffect(() => {
    const productsWithFavoriteStatus = products.map(product => ({
      ...product,
      isFavorite: favoriteProducts.some(fav => fav.id === product.id),
    })) as ProductData[]; // Cast to ProductData array
    setFilteredProducts(productsWithFavoriteStatus);
  }, [products, favoriteProducts]);

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
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchAndCategories
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />
      <ScrollView
        style={styles.productsContainer}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productWrapper}>
              {/* Pass the handleAddToCart and onToggleFavorite functions and isFavorite status */}
              <ProductCard
                {...product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={product.isFavorite || false} // Pass isFavorite status
              />
            </View>
          ))
        ) : (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>No products found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  productsContainer: {
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
  errorText: {
    color: '#666',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Adjust as needed
    width: '100%',
  },
  noProductsText: {
    fontSize: 18,
    color: '#666',
  },
});