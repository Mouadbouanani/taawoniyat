import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductData } from '@/components/ProductCard';
import { useUser } from './UserContext';

export interface CartItem extends ProductData {
  cartQuantity: number;
  sellerId?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: ProductData) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getProductQuantityInCart: (productId: number) => number;
  loadCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated } = useUser();

  // Calculate total cart count
  const cartCount = cartItems.reduce((total, item) => total + item.cartQuantity, 0);

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `cartItems_${user.id}` : 'cartItems_guest';
  };

  // Load cart items from AsyncStorage (user-specific)
  const loadCartItems = async () => {
    try {
      console.log('Loading cart items...');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user);

      if (!isAuthenticated) {
        console.log('User not authenticated, clearing cart items');
        setCartItems([]);
        return;
      }
      const cartKey = getCartKey();
      console.log('Cart key:', cartKey);

      const existingCartJson = await AsyncStorage.getItem(cartKey);
      const items: CartItem[] = existingCartJson ? JSON.parse(existingCartJson) : [];
      console.log('Loaded cart items:', items.length, 'items');
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  };

  // Save cart items to AsyncStorage (user-specific)
  const saveCartItems = async (items: CartItem[]) => {
    try {
      console.log('Saving cart items...');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user?.id, user?.role);

      if (!isAuthenticated || !user) {
        console.log('Cannot save cart items: user not authenticated');
        return;
      }
      const cartKey = getCartKey();
      console.log('Saving to cart key:', cartKey);
      console.log('Items to save:', items.length);

      await AsyncStorage.setItem(cartKey, JSON.stringify(items));
      setCartItems(items);
      console.log('Cart items saved successfully');
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  };

  // Add product to cart
  const addToCart = async (product: ProductData) => {
    try {
      console.log('Adding product to cart:', product.name);
      console.log('User authenticated:', isAuthenticated);
      console.log('User role:', user?.role);

      if (!isAuthenticated || !user) {
        console.log('User not authenticated, throwing error');
        throw new Error('Please log in to add items to cart');
      }

      const cartKey = getCartKey();
      console.log('Using cart key:', cartKey);

      const existingCartJson = await AsyncStorage.getItem(cartKey);
      let items: CartItem[] = existingCartJson ? JSON.parse(existingCartJson) : [];
      console.log('Existing cart items:', items.length);

      const existingItemIndex = items.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // If item exists, increase quantity
        console.log('Product already in cart, increasing quantity');
        items[existingItemIndex].cartQuantity += 1;
      } else {
        // If item doesn't exist, add it with quantity 1
        console.log('Adding new product to cart');
        const newItem: CartItem = {
          ...product,
          cartQuantity: 1,
          sellerId: product.id // You might want to get actual seller ID from product
        };
        items.push(newItem);
      }

      console.log('Saving cart items:', items.length, 'items');
      await saveCartItems(items);
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId: number) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to modify cart');
      }

      const cartKey = getCartKey();
      const existingCartJson = await AsyncStorage.getItem(cartKey);
      let items: CartItem[] = existingCartJson ? JSON.parse(existingCartJson) : [];

      const updatedItems = items.filter(item => item.id !== productId);
      await saveCartItems(updatedItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to modify cart');
      }

      if (quantity < 1) {
        await removeFromCart(productId);
        return;
      }

      const cartKey = getCartKey();
      const existingCartJson = await AsyncStorage.getItem(cartKey);
      let items: CartItem[] = existingCartJson ? JSON.parse(existingCartJson) : [];

      const updatedItems = items.map(item =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      );
      await saveCartItems(updatedItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (!isAuthenticated || !user) {
        setCartItems([]);
        return;
      }

      const cartKey = getCartKey();
      await AsyncStorage.removeItem(cartKey);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Get quantity of specific product in cart
  const getProductQuantityInCart = (productId: number): number => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.cartQuantity : 0;
  };

  // Load cart items on mount and when user changes
  useEffect(() => {
    loadCartItems();
  }, [user, isAuthenticated]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getProductQuantityInCart,
    loadCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
