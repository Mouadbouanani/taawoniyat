import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register-select"
        options={{
          title: 'Register',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="client-register"
        options={{
          title: 'Client Registration',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="seller-register"
        options={{
          title: 'Seller Registration',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'My Account',
          headerShown: true,
          headerLeft: () => (
            <Ionicons name="person-circle-outline" size={24} color="#0a7ea4" />
          ),
        }}
      />
    </Stack>
  );
} 