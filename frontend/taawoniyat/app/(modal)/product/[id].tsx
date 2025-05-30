import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ProductDetailsScreen from '@/screens/ProductDetailsScreen';

export default function ProductDetailsModal() {
  const { id } = useLocalSearchParams();
  
  return <ProductDetailsScreen productId={id as string} />;
}
