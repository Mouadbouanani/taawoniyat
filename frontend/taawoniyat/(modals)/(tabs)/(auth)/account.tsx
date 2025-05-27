import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Text,
  Modal,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { authService, Order, OrderItem } from '@/services/authService';
import { ProductData } from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export default function AccountScreen() {
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      if (user?.role === 'SELLER') {
        const sellerProducts = await authService.getSellerProducts(user.id);
        setProducts(sellerProducts);
      }
      const userOrders = await authService.getOrderHistory();
      setOrders(userOrders);
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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
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
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <ThemedText variant="h3">My Account</ThemedText>
        <View style={styles.infoContainer}>
          <InfoItem label="Name" value={user?.fullName || ''} />
          <InfoItem label="Email" value={user?.email || ''} />
          <InfoItem label="Role" value={user?.role || ''} />
        </View>
      </View>

      {user?.role === 'SELLER' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h3">My Products</ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddProductModal(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#0a7ea4" />
              <ThemedText variant="button" style={styles.addButtonText}>
                Add New Product
              </ThemedText>
            </TouchableOpacity>
          </View>
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <ThemedText variant="h3">Order History</ThemedText>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText variant="button" style={styles.logoutButtonText}>
          Logout
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <ThemedText variant="body1" style={styles.infoLabel}>
        {label}:
      </ThemedText>
      <ThemedText variant="body1" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function ProductItem({ product }: { product: ProductData }) {
  return (
    <View style={styles.productItem}>
      {product.images?.[0] && (
        <ExpoImage
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          contentFit="cover"
        />
      )}
      <View style={styles.productInfo}>
        <ThemedText variant="body1" style={styles.productName}>
          {product.name}
        </ThemedText>
        <ThemedText variant="body1" style={styles.productPrice}>
          ${product.price}
        </ThemedText>
        <ThemedText variant="body2" style={styles.productStock}>
          Stock: {product.quantity}
        </ThemedText>
      </View>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.orderCard}>
      <ThemedText variant="h4" style={styles.orderId}>
        Order #{order.id}
      </ThemedText>
      <ThemedText variant="body1" style={styles.orderDate}>
        {new Date(order.date).toLocaleDateString()}
      </ThemedText>
      {order.items.map((item) => (
        <OrderItemDetail key={item.id} item={item} />
      ))}
      <ThemedText variant="body1" style={styles.orderTotal}>
        Total: ${order.totalAmount}
      </ThemedText>
    </View>
  );
}

function OrderItemDetail({ item }: { item: OrderItem }) {
  return (
    <View style={styles.orderItem}>
      <ThemedText variant="body1" style={styles.orderItemName}>
        {item.product.name}
      </ThemedText>
      <ThemedText variant="body2" style={styles.orderItemQuantity}>
        Quantity: {item.quantity}
      </ThemedText>
      <ThemedText variant="body1" style={styles.orderItemPrice}>
        ${item.price}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontWeight: '600',
  },
  productPrice: {
    color: '#0a7ea4',
    marginTop: 4,
  },
  productStock: {
    color: '#666',
    marginTop: 4,
  },
  orderCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
  },
  orderId: {
    fontWeight: '600',
  },
  orderDate: {
    color: '#666',
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderItemName: {
    flex: 1,
  },
  orderItemQuantity: {
    color: '#666',
    marginHorizontal: 8,
  },
  orderItemPrice: {
    fontWeight: '600',
  },
  orderTotal: {
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
  },
}); 