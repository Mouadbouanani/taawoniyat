import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';

// Assuming ProductData structure is consistent with what's used in ProductCard
// and includes sellerFullName
interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  quantity: number; // This is stock quantity
  sellerFullName: string; // Seller's business or full name
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id as string);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch product details from your backend API
      const response = await fetch(`http://localhost:8080/api/products/${productId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data: ProductData = await response.json();
      setProduct(data);
    } catch (error: any) {
      console.error("Failed to fetch product details:", error);
      setError(error.message || 'An error occurred while fetching product details.');
      Alert.alert('Error', error.message || 'Failed to load product details.');
      // Optionally navigate back or show a retry option
    } finally {
      setLoading(false);
    }
  };

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
        {/* Add a retry button or navigate back */}
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Product not found.</ThemedText>
      </View>
    );
  }

  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <ExpoImage source={{ uri: imageUrl }} style={styles.productImage} contentFit="contain" />
        ) : (
          <View style={styles.placeholderImage}><ThemedText>No Image</ThemedText></View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>
        <ThemedText type="subtitle" style={styles.productPrice}>${product.price.toFixed(2)}</ThemedText>
        <ThemedText style={styles.businessName}>Sold by: {product.sellerFullName}</ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Description:</ThemedText>
          <ThemedText style={styles.descriptionText}>{product.description}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Details:</ThemedText>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={18} color="#666" />
            <ThemedText style={styles.detailText}>Category: {product.category}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cube-outline" size={18} color="#666" />
            <ThemedText style={styles.detailText}>Stock: {product.quantity}</ThemedText>
          </View>
        </View>

        {/* Add to Cart or other actions can go here */}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300, // Adjust height as needed
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#2E7D32',
    marginBottom: 12,
  },
  businessName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
    lineHeight: 22,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
}); 