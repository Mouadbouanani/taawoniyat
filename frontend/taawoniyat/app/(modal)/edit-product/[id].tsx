import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EditProductScreen from '@/screens/EditProductScreen';

export default function EditProductModal() {
  const { id } = useLocalSearchParams();
  
  return <EditProductScreen productId={id as string} />;
}
