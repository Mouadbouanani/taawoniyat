import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: 'Checkout',
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="product/[id]" 
        options={{ 
          title: 'Product Details',
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="edit-product/[id]" 
        options={{ 
          title: 'Edit Product',
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="seller-product-details/[id]" 
        options={{ 
          title: 'Seller Product Details',
          presentation: 'modal',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
