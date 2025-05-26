import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { authService, Product } from '@/services/authService';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { user, logout, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const router = useRouter();

  const fetchUserDetails = async () => {
    try {
      await authService.getUserDetails();
      if (user?.role === 'SELLER') {
        const sellerProducts = await authService.getSellerProducts();
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetails();
  };

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
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.avatar}
        />
        <ThemedText type="title" style={styles.name}>
          {user?.fullName}
        </ThemedText>
        <ThemedText style={styles.email}>{user?.email}</ThemedText>
        {user?.role === 'SELLER' && user?.businessName && (
          <ThemedText style={styles.businessName}>
            {user.businessName}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Personal Information
        </ThemedText>
        <View style={styles.infoContainer}>
          <InfoItem icon="call-outline" label="Phone" value={user?.phone} />
          <InfoItem icon="location-outline" label="Region" value={user?.region} />
          <InfoItem icon="business-outline" label="City" value={user?.city} />
          <InfoItem icon="home-outline" label="Address" value={user?.address} />
        </View>
      </View>

      {user?.role === 'SELLER' && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.productsHeader}
            onPress={() => setShowProducts(!showProducts)}
          >
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              My Products
            </ThemedText>
            <Ionicons
              name={showProducts ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          {showProducts && (
            <View style={styles.productsContainer}>
              {products.length > 0 ? (
                products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => router.push(`/product?id=${product.id}`)}
                  >
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName}>
                        {product.name}
                      </ThemedText>
                      <ThemedText style={styles.productPrice}>
                        ${product.price.toFixed(2)}
                      </ThemedText>
                      <ThemedText style={styles.productStock}>
                        Stock: {product.stock}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <ThemedText style={styles.noProducts}>
                  No products found
                </ThemedText>
              )}
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={20} color="#666" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        <ThemedText style={styles.infoValue}>{value || 'Not provided'}</ThemedText>
      </View>
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
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productsContainer: {
    marginTop: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#0a7ea4',
    fontWeight: '600',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  noProducts: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});