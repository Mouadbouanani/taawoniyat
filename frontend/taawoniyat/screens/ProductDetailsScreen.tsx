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
import { useRouter } from 'expo-router';
import { ProductData } from '@/components/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ProductDetails extends ProductData {
  seller: {
    id: number;
    fullName: string;
    businessName?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
}

interface ProductDetailsScreenProps {
  productId: string;
}

export default function ProductDetailsScreen({ productId }: ProductDetailsScreenProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/store/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      } else {
        Alert.alert('Error', 'Failed to load product details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // Check if user is authenticated
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) {
        Alert.alert(
          'Login Required',
          'Please log in to add items to your cart',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/Account/login') }
          ]
        );
        return;
      }

      const user = JSON.parse(userJson);
      const cartKey = `cartItems_${user.id}`;

      // Get current cart items from AsyncStorage (user-specific)
      const existingCartJson = await AsyncStorage.getItem(cartKey);
      let cartItems: (ProductData & { cartQuantity: number })[] = existingCartJson
        ? JSON.parse(existingCartJson)
        : [];

      // Check if the product is already in the cart
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // If item exists, increase quantity
        cartItems[existingItemIndex].cartQuantity += 1;
      } else {
        // If item doesn't exist, add it to cart with quantity 1
        const productWithQuantity = {
          ...product,
          cartQuantity: 1
        };
        cartItems.push(productWithQuantity);
      }

      // Save updated cart to AsyncStorage (user-specific)
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));

      // Calculate total number of items in cart
      const totalItemsInCart = cartItems.reduce((total, item) => total + item.cartQuantity, 0);

      // Show notification with total cart count
      Alert.alert(
        'Added to Cart!',
        `You now have ${totalItemsInCart} item${totalItemsInCart === 1 ? '' : 's'} in your cart`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleContactSeller = () => {
    if (product?.seller) {
      Alert.alert(
        'Contact Seller',
        `Contact ${product.seller.fullName}\nPhone: ${product.seller.phone}\nEmail: ${product.seller.email}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call seller') },
          { text: 'Email', onPress: () => console.log('Email seller') },
        ]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText>Product not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#008080" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                source={{ uri: product.images[currentImageIndex] }}
                style={styles.mainImage}
                contentFit="cover"
              />
              {product.images.length > 1 && (
                <View style={styles.imageIndicators}>
                  {product.images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.indicator,
                        currentImageIndex === index && styles.activeIndicator,
                      ]}
                      onPress={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </View>
              )}
              {product.images.length > 1 && (
                <ScrollView
                  horizontal
                  style={styles.thumbnailContainer}
                  showsHorizontalScrollIndicator={false}
                >
                  {product.images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        source={{ uri: image }}
                        style={[
                          styles.thumbnail,
                          currentImageIndex === index && styles.activeThumbnail,
                        ]}
                        contentFit="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={80} color="#ccc" />
              <ThemedText style={styles.noImageText}>No Image Available</ThemedText>
            </View>
          )}
        </View>

        {/* Product Information */}
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName}>
            {product.name}
          </ThemedText>

          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>
              {product.price.toFixed(2)} DH
            </ThemedText>
            <View style={styles.stockContainer}>
              <Ionicons
                name={product.quantity > 0 ? "checkmark-circle" : "close-circle"}
                size={20}
                color={product.quantity > 0 ? "#4CAF50" : "#f44336"}
              />
              <ThemedText style={[
                styles.stockText,
                { color: product.quantity > 0 ? "#4CAF50" : "#f44336" }
              ]}>
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <ThemedText style={styles.category}>{product.category}</ThemedText>
          </View>

          <ThemedText style={styles.description}>
            {product.description}
          </ThemedText>
        </View>

        {/* Seller Information */}
        {product.seller && (
          <View style={styles.sellerInfo}>
            <ThemedText style={styles.sectionTitle}>
              Seller Information
            </ThemedText>

            <View style={styles.sellerCard}>
              <View style={styles.sellerHeader}>
                <Ionicons name="person-circle-outline" size={40} color="#008080" />
                <View style={styles.sellerDetails}>
                  <ThemedText style={styles.sellerName}>
                    {product.seller.fullName}
                  </ThemedText>
                  {product.seller.businessName && (
                    <ThemedText style={styles.businessName}>
                      {product.seller.businessName}
                    </ThemedText>
                  )}
                </View>
              </View>

              <View style={styles.sellerContact}>
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <ThemedText style={styles.contactText}>
                    {product.seller.address}, {product.seller.city}, {product.seller.region}
                  </ThemedText>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <ThemedText style={styles.contactText}>
                    {product.seller.phone}
                  </ThemedText>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <ThemedText style={styles.contactText}>
                    {product.seller.email}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <ThemedText style={styles.contactButtonText}>Contact Seller</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.addToCartButton, product.quantity === 0 && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={product.quantity === 0}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <ThemedText style={styles.addToCartText}>
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </ThemedText>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008080',
  },
  content: {
    flex: 1,
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
  imageContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  mainImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#008080',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#008080',
  },
  noImageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sellerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sellerCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  sellerContact: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
