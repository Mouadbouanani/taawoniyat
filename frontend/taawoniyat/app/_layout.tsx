import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Button, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthModal from '@/components/AuthModal';
import { useRouter } from 'expo-router';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

// Import SVG icons
import HomeIconInactive from '../assets/images/icons/shop-1.svg';
import HomeIconActive from '../assets/images/icons/shop-2.svg';
import ExploreIconInactive from '../assets/images/icons/explore-1.svg';
import ExploreIconActive from '../assets/images/icons/explore-2.svg';
import CartIconInactive from '../assets/images/icons/cart-1.svg';
import CartIconActive from '../assets/images/icons/cart-2.svg';
import FavoriteIconInactive from '../assets/images/icons/favorite-1.svg';
import FavoriteIconActive from '../assets/images/icons/favorite-2.svg';
import AccountIconInactive from '../assets/images/icons/account-1.svg';
import AccountIconActive from '../assets/images/icons/account-2.svg';

function LoginButton() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUser();

  if (isAuthenticated && user) {
    return (
      <TouchableOpacity
        onPress={() => router.push('/Account/account')}
        style={{ marginRight: 15 }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
          {user.fullName}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push('/Account/login')}
      style={{ marginRight: 15 }}
    >
      <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>Login</ThemedText>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#0a7ea4',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              borderTopColor: colorScheme === 'dark' ? '#333' : '#ddd',
            },
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
            },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerRight: () => <LoginButton />,
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
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Cart',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart-outline" size={size} color={color} />
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
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserProvider>
  );
}