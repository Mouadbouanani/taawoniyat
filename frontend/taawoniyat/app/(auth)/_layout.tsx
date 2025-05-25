import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="client-register"
        options={{
          title: 'Register as Client',
        }}
      />
      <Stack.Screen
        name="seller-register"
        options={{
          title: 'Register as Seller',
        }}
      />
    </Stack>
  );
} 