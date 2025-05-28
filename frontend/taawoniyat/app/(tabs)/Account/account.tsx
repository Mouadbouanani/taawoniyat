import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Text,
  Modal,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { ProductData } from '@/components/ProductCard';
import * as ImagePicker from 'expo-image-picker';

// Updated interfaces to match backend structure
export interface PanierItem {
  id: number;
  quantity: number;
  price: number;
  product: ProductData;
}

export interface Order {
  panier_id: number;
  date: string;
  items: PanierItem[];
  client: {
    id: number;
    fullName: string;
    email: string;
  };
}

export default function AccountScreen() {
  const { user, logout, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && router.replace) {
      Promise.resolve().then(() => {
        router.replace('/Account/login');
      });
    }
  }, [isAuthenticated, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === 'seller') {
        // Load seller's products
        const sellerProducts = await fetchSellerProducts();
        setProducts(sellerProducts || []);

        // Load orders received by seller (panier history)
        const sellerOrders = await fetchSellerOrders();
        setOrders(sellerOrders || []);
      } else if (user?.role === 'client') {
        // Load client's order history
        const clientOrders = await fetchClientOrders();
        setOrders(clientOrders || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load account data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch functions for different data types
  const fetchSellerProducts = async (): Promise<ProductData[]> => {
    try {
      // Use the existing working endpoint from StoreController
      // Filter products by current user's business name
      const response = await fetch('http://localhost:8080/store/products');
      if (response.ok) {
        const allProducts = await response.json();
        // Filter products that belong to the current seller
        const sellerProducts = allProducts.filter((product: ProductData) =>
          product.sellerFullName === user?.fullName
        );
        return sellerProducts;
      } else {
        console.error('Failed to fetch products:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }
  };

  const fetchClientOrders = async (): Promise<Order[]> => {
    try {
      console.log('Fetching client orders using authService...');
      const orders = await authService.getClientOrders();
      console.log('Client orders fetched:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching client orders:', error);
      return [];
    }
  };

  const fetchSellerOrders = async (): Promise<any[]> => {
    try {
      console.log('Fetching seller orders using authService...');
      const orders = await authService.getSellerOrders();
      console.log('Seller orders fetched:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/Account/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <ThemedText style={styles.loadingText}>Loading account data...</ThemedText>
      </View>
    );
  }

  const renderTabButton = (tab: 'overview' | 'products' | 'orders', label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#FFF8DC' : '#8B4513'}
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={60} color="#8B4513" />
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>{user?.fullName}</ThemedText>
              <ThemedText style={styles.userRole}>
                {user?.role === 'seller' ? 'Seller' : 'Client'}
              </ThemedText>
              {user?.role === 'seller' && user?.businessName && (
                <ThemedText style={styles.businessName}>{user.businessName}</ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview', 'person-outline')}
        {user?.role === 'seller' && renderTabButton('products', 'Products', 'cube-outline')}
        {renderTabButton('orders', user?.role === 'seller' ? 'Orders Received' : 'Order History', 'receipt-outline')}
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            <View style={styles.infoContainer}>
              <InfoItem label="Full Name" value={user?.fullName || ''} />
              <InfoItem label="Email" value={user?.email || ''} />
              <InfoItem label="Phone" value={user?.phone || ''} />
              <InfoItem label="City" value={user?.city || ''} />
              <InfoItem label="Region" value={user?.region || ''} />
              <InfoItem label="Address" value={user?.address || ''} />
              {user?.role === 'seller' && user?.businessName && (
                <InfoItem label="Business Name" value={user.businessName} />
              )}
            </View>
          </View>
        )}

        {activeTab === 'products' && user?.role === 'seller' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>My Products</ThemedText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddProductModal(true)}
              >
                <Ionicons name="add-circle" size={24} color="#8B4513" />
                <Text style={styles.addButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>

            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyStateText}>No products found</ThemedText>
                <ThemedText style={styles.emptyStateSubtext}>
                  Start by adding your first product
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item, index) => {
                  const id = item?.id;
                  return id ? id.toString() : `product-${index}`;
                }}
                renderItem={({ item }) => <ProductItem product={item} onRefresh={loadData} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {user?.role === 'seller' ? 'Orders Received' : 'Order History'}
            </ThemedText>

            {orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyStateText}>No orders found</ThemedText>
                <ThemedText style={styles.emptyStateSubtext}>
                  {user?.role === 'seller'
                    ? 'Orders from customers will appear here'
                    : 'Your order history will appear here'
                  }
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item, index) => {
                  const id = item?.panier_id || item?.orderId || item?.id;
                  return id ? id.toString() : `order-${index}`;
                }}
                renderItem={({ item }) => <OrderCard order={item} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={loadData}
      />
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

function ProductItem({ product, onRefresh }: { product: ProductData; onRefresh: () => void }) {
  const router = useRouter();

  const handleDeleteProduct = async () => {
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
              const success = await authService.deleteSellerProduct(product.id);

              if (success) {
                Alert.alert('Success', 'Product deleted successfully');
                onRefresh();
              } else {
                Alert.alert('Error', 'Failed to delete product. Please check your authentication and try again.');
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

  return (
    <View style={styles.productItem}>
      {product.images && product.images.length > 0 ? (
        <ExpoImage
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#ccc" />
        </View>
      )}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </ThemedText>
        <ThemedText style={styles.productPrice}>${product.price.toFixed(2)}</ThemedText>
        <ThemedText style={styles.productStock}>Stock: {product.quantity}</ThemedText>
        <ThemedText style={styles.productCategory}>Category: {product.category}</ThemedText>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/(modal)/edit-product/${product.id}`)}>
          <Ionicons name="create-outline" size={20} color="#8B4513" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OrderCard({ order }: { order: any }) {
  const calculateTotal = () => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total: number, item: any) => {
        const price = typeof item.price === 'object' ? parseFloat(item.price) : item.price;
        const orderedQuantity = item.quantity || 1; // Use ordered quantity
        return total + (price * orderedQuantity);
      }, 0);
    }
    return 0;
  };

  // Handle both client orders and seller orders
  const orderId = order.panier_id || order.orderId;
  const orderDate = order.date || order.orderDate;
  const items = order.items || [];
  const client = order.client;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <ThemedText style={styles.orderId}>Order #{orderId}</ThemedText>
        <ThemedText style={styles.orderDate}>
          {orderDate ? new Date(orderDate).toLocaleDateString() : 'N/A'}
        </ThemedText>
      </View>

      {client && (
        <View style={styles.clientInfo}>
          <ThemedText style={styles.clientName}>
            Customer: {typeof client === 'string' ? client : client.fullName || client.name || 'Unknown'}
          </ThemedText>
          {typeof client === 'object' && client.email && (
            <ThemedText style={styles.clientEmail}>📧 {client.email}</ThemedText>
          )}
          {typeof client === 'object' && client.phone && (
            <ThemedText style={styles.clientEmail}>📞 {client.phone}</ThemedText>
          )}
          {typeof client === 'object' && client.address && (
            <ThemedText style={styles.clientEmail}>📍 {client.address}, {client.city || ''}</ThemedText>
          )}
        </View>
      )}

      <View style={styles.orderItems}>
        {items.map((item: any, idx: number) => {
          const productName = item.product?.name || item.product || 'Unknown Product';
          const price = typeof item.price === 'object' ? parseFloat(item.price) : item.price;
          // Use the ordered quantity, not the product stock quantity
          const orderedQuantity = item.quantity || 1;

          return (
            <View key={idx} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <ThemedText style={styles.orderItemName}>{productName}</ThemedText>
                <ThemedText style={styles.orderItemDetails}>
                  Ordered: {orderedQuantity} × ${price?.toFixed(2) || '0.00'}
                </ThemedText>
                {item.product?.quantity && (
                  <ThemedText style={styles.stockInfo}>
                    Stock available: {item.product.quantity}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={styles.orderItemTotal}>
                ${((price || 0) * orderedQuantity).toFixed(2)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <View style={styles.orderFooter}>
        <ThemedText style={styles.orderTotal}>
          Total: ${calculateTotal().toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );
}

function AddProductModal({ visible, onClose, onProductAdded }: {
  visible: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}) {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/store/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const imageFiles: File[] = [];

        // Limit to maximum 5 images total
        const remainingSlots = 5 - selectedImages.length;
        const assetsToProcess = result.assets.slice(0, remainingSlots);

        for (const asset of assetsToProcess) {
          if (Platform.OS === 'web') {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const file = new File([blob], asset.fileName || 'image.jpg', { type: blob.type });
            imageFiles.push(file);
          } else {
            // For native platforms, we'll need to handle this differently
            // For now, we'll create a mock File object
            const file = {
              uri: asset.uri,
              name: asset.fileName || 'image.jpg',
              type: asset.mimeType || 'image/jpeg'
            } as any;
            imageFiles.push(file);
          }
        }

        setSelectedImages(prev => [...prev, ...imageFiles]);

        if (result.assets.length > remainingSlots) {
          Alert.alert('Limit Reached', `You can only add ${remainingSlots} more images. Maximum 5 images allowed.`);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.quantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Use the new JWT-authenticated endpoint with image support
      const newProduct = await authService.addProductWithImages({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        quantity: parseInt(productData.quantity),
      }, selectedImages.length > 0 ? selectedImages : undefined);

      if (newProduct) {
        Alert.alert('Success', `Product added successfully${selectedImages.length > 0 ? ' with images' : ''}!`);
        setProductData({ name: '', description: '', price: '', category: '', quantity: '' });
        setSelectedImages([]);
        onProductAdded();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add product. Please check your authentication and try again.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <ThemedText style={styles.modalTitle}>Add New Product</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#8B4513" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Product Name</ThemedText>
            <TextInput
              style={styles.textInput}
              value={productData.name}
              onChangeText={(text) => setProductData({ ...productData, name: text })}
              placeholder="Enter product name"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Description</ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={productData.description}
              onChangeText={(text) => setProductData({ ...productData, description: text })}
              placeholder="Enter product description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Price ($)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={productData.price}
              onChangeText={(text) => setProductData({ ...productData, price: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Category</ThemedText>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    productData.category === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setProductData({ ...productData, category })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    productData.category === category && styles.selectedCategoryButtonText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Quantity</ThemedText>
            <TextInput
              style={styles.textInput}
              value={productData.quantity}
              onChangeText={(text) => setProductData({ ...productData, quantity: text })}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Product Images (Optional)</ThemedText>

            {/* Main Image Display */}
            {selectedImages.length > 0 ? (
              <View style={styles.mainImageContainer}>
                <ExpoImage
                  source={{ uri: (selectedImages[0] as any).uri || URL.createObjectURL(selectedImages[0]) }}
                  style={styles.mainImage}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeMainImageButton}
                  onPress={() => removeImage(0)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
                <Ionicons name="camera-outline" size={48} color="#8B4513" />
                <Text style={styles.imagePickerText}>Add Product Images</Text>
                <Text style={styles.imagePickerSubtext}>Up to 5 images</Text>
              </TouchableOpacity>
            )}

            {/* Thumbnail Gallery */}
            {selectedImages.length > 0 && (
              <View style={styles.thumbnailContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.thumbnailItem}>
                      <ExpoImage
                        source={{ uri: (image as any).uri || URL.createObjectURL(image) }}
                        style={[
                          styles.thumbnailImage,
                          index === 0 && styles.activeThumbnail
                        ]}
                        contentFit="cover"
                      />
                      {index > 0 && (
                        <TouchableOpacity
                          style={styles.removeThumbnailButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close-circle" size={16} color="#ff4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Add More Images Button */}
                  {selectedImages.length < 5 && (
                    <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                      <Ionicons name="add" size={24} color="#8B4513" />
                    </TouchableOpacity>
                  )}
                </ScrollView>

                <Text style={styles.imageCountText}>
                  {selectedImages.length}/5 images
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8DC" />
            ) : (
              <Text style={styles.submitButtonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#8B4513',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#FFF8DC',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D2B48C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  userRole: {
    fontSize: 16,
    color: '#8B4513',
    opacity: 0.8,
    marginTop: 2,
  },
  businessName: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.6,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTabButton: {
    backgroundColor: '#8B4513',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  activeTabButtonText: {
    color: '#FFF8DC',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#8B4513',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e6f3ff',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffe6e6',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  clientInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clientEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderItemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'right',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF8DC',
    borderBottomWidth: 1,
    borderBottomColor: '#D2B48C',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D2B48C',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D2B48C',
    backgroundColor: '#fff',
  },
  selectedCategoryButton: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectedCategoryButtonText: {
    color: '#FFF8DC',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF8DC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DC',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    marginTop: 8,
    minHeight: 200,
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  imagePickerSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
  },
  mainImageContainer: {
    position: 'relative',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeMainImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnailScroll: {
    marginBottom: 8,
  },
  thumbnailItem: {
    position: 'relative',
    marginRight: 8,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#8B4513',
  },
  removeThumbnailButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B4513',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DC',
  },
  imageCountText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  selectedImageItem: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  // Order card styles
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  clientInfo: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clientEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  stockInfo: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  orderFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'right',
  },
});