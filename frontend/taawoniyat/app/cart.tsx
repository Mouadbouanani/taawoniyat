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
    TextInput,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  import { ThemedText } from '@/components/ThemedText';
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  import { useUser } from '@/contexts/UserContext';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { ProductData } from '@/components/ProductCard';
  import { useFocusEffect } from '@react-navigation/native';
  import axios from 'axios';

  interface CartItem extends ProductData {
    cartQuantity: number;
    sellerId: number;
  }

  interface CheckoutForm {
    fullName: string;
    email: string;
    address: string;
    city: string;
    region: string;
    phone: string;
  }

  export default function CartScreen() {
    const { user, isAuthenticated } = useUser();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
      fullName: '',
      email: '',
      address: '',
      city: '',
      region: '',
      phone: '',
    });
    const router = useRouter();

    const loadCartItems = async () => {
      setLoading(true);
      try {
        console.log('Loading cart items from AsyncStorage...');
        const existingCartJson = await AsyncStorage.getItem('cartItems');
        const items: CartItem[] = existingCartJson ? JSON.parse(existingCartJson) : [];
        console.log('Loaded cart items:', items);
        setCartItems(items);
      } catch (error) {
        console.error('Error loading cart items from AsyncStorage:', error);
        Alert.alert('Error', 'Failed to load cart items.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    const saveCartItems = async (items: CartItem[]) => {
      try {
        console.log('Saving cart items to AsyncStorage:', items);
        await AsyncStorage.setItem('cartItems', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart items to AsyncStorage:', error);
        Alert.alert('Error', 'Failed to save cart items.');
      }
    };

    useFocusEffect(
      React.useCallback(() => {
        loadCartItems();
      }, [])
    );

    const onRefresh = async () => {
      setRefreshing(true);
      await loadCartItems();
    };

    const updateQuantity = async (itemId: number, newQuantity: number) => {
      if (newQuantity < 1) return;

      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      await saveCartItems(updatedItems);
    };

    const removeItem = async (itemId: number) => {
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      await saveCartItems(updatedItems);
    };

    const calculateTotal = () => {
      return cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);
    };

    const handleCheckout = async () => {
      if (!validateCheckoutForm()) {
        return;
      }

      try {
        // Get the logged in user from context
        const user = await AsyncStorage.getItem('user');
        if (!user) {
          Alert.alert('Authentication Required', 'Please log in to save your cart', [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Login',
              onPress: () => router.push('/Account/login')
            }
          ]);
          return;
        }
        const userData = JSON.parse(user);

        // Prepare cart data for the API
        const panierData = {
          client: { id: userData.id },
          items: cartItems.map(item => ({
            product: { id: item.id },
            quantity: item.cartQuantity,
            price: item.price,
            seller: { id: item.sellerId }
          }))
        };

        // Save cart to backend
        const response = await axios.post('http://localhost:8080/panier/save', panierData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });

        if (response.status === 200) {
          // Clear local cart after successful save
          await saveCartItems([]);
          setCartItems([]);
          setShowCheckout(false);
          Alert.alert('Success', 'Your cart has been saved successfully!');
        }
      } catch (error: any) {
        console.error('Error saving cart:', error);
        Alert.alert('Error', 'Failed to save your cart. Please try again.');
      }
    };

    const validateCheckoutForm = () => {
      if (!checkoutForm.fullName || !checkoutForm.email || !checkoutForm.address ||
          !checkoutForm.city || !checkoutForm.region || !checkoutForm.phone) {
        Alert.alert('Error', 'Please fill in all fields');
        return false;
      }
      return true;
    };

    const renderCheckoutForm = () => (
      <View style={styles.checkoutForm}>
        <ThemedText variant="h1" style={styles.checkoutTitle}>Checkout</ThemedText>
        
        <View style={styles.formSection}>
          <ThemedText variant="h2" style={styles.sectionTitle}>Shipping Information</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={checkoutForm.fullName}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, fullName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={checkoutForm.email}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, email: text })}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={checkoutForm.address}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, address: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={checkoutForm.city}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, city: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Region"
            value={checkoutForm.region}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, region: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={checkoutForm.phone}
            onChangeText={(text) => setCheckoutForm({ ...checkoutForm, phone: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.checkoutActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCheckout(false)}
          >
            <ThemedText variant="button" style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handleCheckout}
          >
            <ThemedText variant="button" style={styles.placeOrderButtonText}>Save Cart</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyText}>
            Please log in to view your cart
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/Account/login')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (cartItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyText}>
            Your cart is empty
          </ThemedText>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/shop')}
          >
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <ThemedText variant="h1" style={styles.title}>Shopping Cart</ThemedText>
            <ThemedText variant="body1" style={styles.itemCount}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </ThemedText>
          </View>

          {!showCheckout ? (
            <>
              <View style={styles.itemsContainer}>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <Image
                      source={{ uri: item.images && item.images.length > 0 ? item.images[0] : '' }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                      <ThemedText style={styles.itemPrice}>
                        ${item.price.toFixed(2)}
                      </ThemedText>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        >
                          <Ionicons name="remove" size={20} color="#666" />
                        </TouchableOpacity>
                        <ThemedText style={styles.quantity}>
                          {item.cartQuantity}
                        </ThemedText>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        >
                          <Ionicons name="add" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    ${calculateTotal().toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Shipping</ThemedText>
                  <ThemedText style={styles.summaryValue}>Free</ThemedText>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={styles.totalValue}>
                    ${calculateTotal().toFixed(2)}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => setShowCheckout(true)}
              >
                <ThemedText style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            renderCheckoutForm()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    loginButton: {
      backgroundColor: '#0a7ea4',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    shopButton: {
      backgroundColor: '#0a7ea4',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    shopButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    itemCount: {
      fontSize: 16,
      color: '#666',
    },
    itemsContainer: {
      padding: 20,
    },
    cartItem: {
      flexDirection: 'row',
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      marginBottom: 12,
      padding: 12,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 4,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 16,
      color: '#0a7ea4',
      fontWeight: '600',
      marginBottom: 8,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
    },
    quantity: {
      fontSize: 16,
      marginHorizontal: 12,
      minWidth: 24,
      textAlign: 'center',
    },
    removeButton: {
      padding: 8,
    },
    summary: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 16,
      color: '#666',
    },
    summaryValue: {
      fontSize: 16,
    },
    totalRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '600',
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '600',
      color: '#0a7ea4',
    },
    checkoutButton: {
      backgroundColor: '#0a7ea4',
      margin: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    checkoutForm: {
      padding: 20,
    },
    checkoutTitle: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
    },
    formSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      fontSize: 16,
    },
    checkoutActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 8,
      flex: 1,
      marginRight: 10,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#666',
      fontSize: 16,
      fontWeight: '600',
    },
    placeOrderButton: {
      backgroundColor: '#0a7ea4',
      padding: 15,
      borderRadius: 8,
      flex: 1,
      marginLeft: 10,
      alignItems: 'center',
    },
    placeOrderButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });