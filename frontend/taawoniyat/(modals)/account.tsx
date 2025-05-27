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

const InfoItem = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string | number | undefined | null }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={20} color="#666" />
    <View style={styles.infoTextContainer}>
      <ThemedText variant="body1" style={styles.infoLabel}>{label}:</ThemedText>
      <ThemedText variant="body1" style={styles.infoValue}>{value ?? 'N/A'}</ThemedText>
    </View>
  </View>
);

const ProductItem = ({ product, onEdit, onDelete }: { product: ProductData; onEdit: (product: ProductData) => void; onDelete: (productId: number) => void }) => (
  <View style={sellerStyles.productItem}>
    <ExpoImage source={{ uri: product.images?.[0] || '' }} style={sellerStyles.productImage} contentFit="cover" />
    <View style={sellerStyles.productInfo}>
      <ThemedText variant="body1" style={sellerStyles.productName}>{product.name}</ThemedText>
      <ThemedText variant="body1" style={sellerStyles.productPrice}>${product.price.toFixed(2)}</ThemedText>
      <ThemedText variant="body2" style={sellerStyles.productStock}>Stock: {product.quantity}</ThemedText>
    </View>
    <View style={sellerStyles.productActions}>
      <TouchableOpacity onPress={() => onEdit(product)} style={sellerStyles.actionButton}>
        <Ionicons name="create-outline" size={20} color="#0a7ea4" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(product.id)} style={sellerStyles.actionButton}>
        <Ionicons name="trash-outline" size={20} color="#ff4646" />
      </TouchableOpacity>
    </View>
  </View>
);

const OrderItemDetail = ({ item }: { item: OrderItem }) => (
  <View style={orderStyles.orderItemDetail}>
    <ThemedText variant="body1" style={orderStyles.orderItemName}>{item.productName}</ThemedText>
    <ThemedText variant="body2" style={orderStyles.orderItemQuantity}>Qty: {item.quantity}</ThemedText>
    <ThemedText variant="body1" style={orderStyles.orderItemPrice}>${item.price.toFixed(2)}</ThemedText>
  </View>
);

const OrderCard = ({ order, isSellerView }: { order: Order; isSellerView: boolean }) => (
  <View style={orderStyles.orderCard}>
    <ThemedText variant="h4" style={orderStyles.orderId}>Order #{order.id}</ThemedText>
    {isSellerView && order.client && (
      <View style={orderStyles.clientInfo}>
        <ThemedText variant="body1" style={orderStyles.clientName}>Client: {order.client.fullName}</ThemedText>
        <ThemedText variant="body2" style={orderStyles.clientEmail}>Email: {order.client.email}</ThemedText>
      </View>
    )}
    <ThemedText variant="body2" style={orderStyles.orderDate}>Date: {new Date(order.orderDate).toLocaleDateString()}</ThemedText>
    <ThemedText variant="body2" style={orderStyles.orderStatus}>Status: {order.status}</ThemedText>
    <View style={orderStyles.orderItemsContainer}>
      <ThemedText variant="body1" style={orderStyles.itemsTitle}>Items:</ThemedText>
      {order.items.map(item => (
        <OrderItemDetail key={item.productId} item={item} />
      ))}
    </View>
    <ThemedText variant="body1" style={orderStyles.orderTotal}>Total: ${order.totalAmount.toFixed(2)}</ThemedText>
  </View>
);

const AddProductModal = ({ visible, onClose, onProductAdded }: { visible: boolean; onClose: () => void; onProductAdded: () => void }) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productImage, setProductImage] = useState<any>(null);
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.fileName || 'upload.jpg', { type: blob.type });
        setProductImage(file);
      } else {
        setProductImage({ uri: asset.uri, name: asset.fileName, type: asset.mimeType });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !description || !price || !productImage || !category || !quantity) {
      Alert.alert('Missing Fields', 'Please fill in all product details and select an image.');
      return;
    }

    const newProductData = {
      name: productName,
      description: description,
      price: parseFloat(price),
      category: category,
      quantity: parseInt(quantity, 10),
    };

    setLoading(true);
    let addedProduct = null;
    try {
      addedProduct = await authService.addSellerProduct(newProductData);

      if (!addedProduct) {
        Alert.alert('Error', 'Failed to add product details.');
        return;
      }

      const imageUrl = await authService.uploadProductImage(addedProduct.id, productImage);

      if (!imageUrl) {
        Alert.alert('Image Upload Failed', 'Product details saved, but failed to upload image.');
      }

      Alert.alert('Success', 'Product added successfully!');
      onProductAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding product with image:', error);
      Alert.alert('Error', 'An unexpected error occurred during product creation.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setProductImage(null);
    setCategory('');
    setQuantity('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <ThemedText variant="h3" style={modalStyles.modalTitle}>Add New Product</ThemedText>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.scrollView}>
            <TextInput
              style={modalStyles.input}
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={[modalStyles.input, modalStyles.descriptionInput]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput
              style={modalStyles.input}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={modalStyles.imagePickerButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#0a7ea4" />
              <ThemedText variant="body1" style={modalStyles.imagePickerButtonText}>
                {productImage ? 'Image Selected' : 'Pick Product Image'}
              </ThemedText>
            </TouchableOpacity>
            {productImage && (
              <ThemedText variant="body2" style={modalStyles.imageSelectedText}>
                {Platform.OS === 'web' ? (productImage as File).name : (productImage as { name: string }).name}
              </ThemedText>
            )}
            <TextInput
              style={modalStyles.input}
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={modalStyles.input}
              placeholder="Quantity (Stock)"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={modalStyles.addButton}
              onPress={handleAddProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText variant="button" style={modalStyles.addButtonText}>Add Product</ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function AccountScreen() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [sellerProducts, setSellerProducts] = useState<ProductData[]>([]);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const fetchUserData = useCallback(async () => {
    setRefreshing(true);
    if (user?.role === 'seller') {
      setLoadingProducts(true);
      setLoadingOrders(true);
      const products = await authService.getSellerProducts() as ProductData[] | null;
      console.log('Fetched seller products:', products);
      if (products) setSellerProducts(products);
      else setSellerProducts([]);
      setLoadingProducts(false);

      const orders = await authService.getSellerOrders();
      console.log('Fetched seller orders:', orders);
      if (orders) setSellerOrders(orders);
      else setSellerOrders([]);
      setLoadingOrders(false);

    } else if (user?.role === 'client') {
      setLoadingOrders(true);
      const orders = await authService.getClientOrders();
      console.log('Fetched client orders:', orders);
      if (orders) setClientOrders(orders);
      else setClientOrders([]);
      setLoadingOrders(false);
    }
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: ProductData) => {
    Alert.alert('Edit Product', `Navigate to edit screen for ${product.name}`);
  };

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            const success = await authService.deleteSellerProduct(productId);
            if (success) {
              Alert.alert('Success', 'Product deleted successfully.');
              fetchUserData();
            } else {
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Please log in to view your account.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />
      }
    >
      <View style={styles.header}>
        <ThemedText variant="h2">My Account</ThemedText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <ThemedText variant="button" style={styles.logoutButtonText}>Logout</ThemedText>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText variant="h3">Personal Information</ThemedText>
        <InfoItem icon="person-outline" label="Name" value={user.fullName} />
        <InfoItem icon="mail-outline" label="Email" value={user.email} />
        {user.phone && <InfoItem icon="call-outline" label="Phone" value={user.phone} />}
        {user.address && <InfoItem icon="location-outline" label="Address" value={user.address} />}
        {user.city && <InfoItem icon="business-outline" label="City" value={user.city} />}
        {user.region && <InfoItem icon="map-outline" label="Region" value={user.region} />}

        {user.role === 'seller' && (
          <InfoItem icon="storefront-outline" label="Business Name" value={user.businessName} />
        )}
      </View>

      {user.role === 'client' && (
        <View style={styles.section}>
          <ThemedText variant="h3">Order History</ThemedText>
          {loadingOrders ? (
            <ActivityIndicator size="small" color="#0a7ea4" />
          ) : clientOrders.length > 0 ? (
            clientOrders.map(order => <OrderCard key={order.id} order={order} isSellerView={false} />)
          ) : (
            <ThemedText variant="body1" style={styles.emptySectionText}>No orders placed yet.</ThemedText>
          )}
        </View>
      )}

      {user.role === 'seller' && (
        <>
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setShowProducts(!showProducts)} style={styles.sectionHeader}>
              <ThemedText variant="h3">My Products</ThemedText>
              <Ionicons name={showProducts ? "chevron-up" : "chevron-down"} size={24} color="#333" />
            </TouchableOpacity>
            {loadingProducts ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : showProducts && sellerProducts.length > 0 ? (
              <View style={sellerStyles.productsGrid}>
                {sellerProducts.map(product => (
                  <ProductItem key={product.id} product={product} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
                ))}
              </View>
            ) : showProducts && (
              <ThemedText variant="body1" style={styles.emptySectionText}>No products listed yet.</ThemedText>
            )}
            {showProducts && (
              <TouchableOpacity onPress={handleAddProduct} style={sellerStyles.addButton}>
                <Ionicons name="add-circle-outline" size={24} color="#0a7ea4" />
                <ThemedText variant="button" style={sellerStyles.addButtonText}>Add New Product</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText variant="h3">Orders Received</ThemedText>
            {loadingOrders ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : sellerOrders.length > 0 ? (
              sellerOrders.map(order => <OrderCard key={order.id} order={order} isSellerView={true} />)
            ) : (
              <ThemedText variant="body1" style={styles.emptySectionText}>No orders received yet.</ThemedText>
            )}
          </View>
        </>
      )}

      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={fetchUserData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4646',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTextContainer: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  }
});

const sellerStyles = StyleSheet.create({
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  productItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 8,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 4,
  },
  productStock: {
     fontSize: 12,
     color: '#666',
     marginTop: 2,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});

const orderStyles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientInfo: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clientEmail: {
    fontSize: 12,
    color: '#666',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 8,
  },
  orderItemsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: {
    fontSize: 12,
    flex: 2,
  },
  orderItemQuantity: {
    fontSize: 12,
    flex: 0.5,
    textAlign: 'center',
  },
  orderItemPrice: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
    color: '#2E7D32',
  }
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  imagePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#0a7ea4',
  },
  imageSelectedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});