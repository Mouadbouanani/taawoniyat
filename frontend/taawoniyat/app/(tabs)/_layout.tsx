import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/theme/designSystem';

function CartIcon({ color, size }: { color: string; size: number }) {
  const { cartCount } = useCart();

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="cart-outline" size={size} color={color} />
      {cartCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: designSystem.colors.error[500],
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#fff',
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: designSystem.colors.primary[500],
        tabBarInactiveTintColor: designSystem.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: designSystem.colors.neutral[200],
          paddingBottom: 8,
          height: 80,
          ...designSystem.shadows.sm,
        },
        headerShown: false, // We'll use custom headers
        tabBarLabelStyle: {
          fontSize: designSystem.typography.sizes.xs,
          fontWeight: designSystem.typography.weights.medium,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <CartIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Favorite',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
