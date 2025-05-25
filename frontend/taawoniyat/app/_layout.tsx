import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Button } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

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
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return <Button title="Login" onPress={handleLogin} />;
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs screenOptions={{ headerShown: true }}>
        <Tabs.Screen
          name="shop"
          options={{
            headerRight: () => <LoginButton />,
            tabBarIcon: ({ focused }) =>
              focused ? <HomeIconActive width={24} height={24} /> : <HomeIconInactive width={24} height={24} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            headerRight: () => <LoginButton />,
            title: 'Explore',
            tabBarIcon: ({ focused }) =>
              focused ? <ExploreIconActive width={24} height={24} /> : <ExploreIconInactive width={24} height={24} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            headerRight: () => <LoginButton />,
            title: 'Cart',
            tabBarIcon: ({ focused }) =>
              focused ? <CartIconActive width={24} height={24} /> : <CartIconInactive width={24} height={24} />,
          }}
        />
        <Tabs.Screen
          name="favorite"
          options={{
            headerRight: () => <LoginButton />,
            title: 'Favorite',
            tabBarIcon: ({ focused }) =>
              focused ? <FavoriteIconActive width={24} height={24} /> : <FavoriteIconInactive width={24} height={24} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            headerRight: () => <LoginButton />,
            title: 'Account',
            tabBarIcon: ({ focused }) =>
              focused ? <AccountIconActive width={24} height={24} /> : <AccountIconInactive width={24} height={24} />,
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}