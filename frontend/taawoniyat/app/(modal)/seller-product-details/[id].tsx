import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/authService';

const { width } = Dimensions.get('window');

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images_url: string[];
  category: string;
  quantity: number;
  seller?: {
    id: number;
    fullName: string;
    businessName?: string;
    email: string;
    phone?: string;
  };
}

export default function SellerProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/store/products/${id}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      } else {
        Alert.alert('Error', 'Failed to load product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/(modal)/edit-product/${id}`);
  };

  const handleDelete = async () => {
    if (!product) return;

    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await authService.deleteSellerProduct(product.id, product.name);
              if (success) {
                Alert.alert('Success', 'Product deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete product');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
        <ThemedText style={styles.loadingText}>Loading product details...</ThemedText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <ThemedText style={styles.errorText}>Product not found</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images_url || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#008080" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#008080" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <>
              <Image
                source={{ uri: images[currentImageIndex] }}
                style={styles.mainImage}
                contentFit="cover"
              />
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailContainer}
                >
                  {images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImageIndex(index)}
                      style={[
                        styles.thumbnail,
                        index === currentImageIndex && styles.activeThumbnail
                      ]}
                    >
                      <Image
                        source={{ uri: image }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <ThemedText style={styles.noImageText}>No images available</ThemedText>
            </View>
          )}
        </View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.productPrice}>{product.price.toFixed(2)} DH</ThemedText>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Category:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.category}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Stock:</ThemedText>
              <ThemedText style={[
                styles.detailValue,
                product.quantity < 10 && styles.lowStock
              ]}>
                {product.quantity} units
                {product.quantity < 10 && ' (Low Stock)'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>{product.description}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.editButtonText}>Edit Product</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <ThemedText style={styles.deleteButtonText}>Delete Product</ThemedText>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  mainImage: {
    width: width,
    height: 300,
  },
  thumbnailContainer: {
    padding: 16,
  },
  thumbnail: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#008080',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
  noImageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  lowStock: {
    color: '#ff4444',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '600',
  },
});
