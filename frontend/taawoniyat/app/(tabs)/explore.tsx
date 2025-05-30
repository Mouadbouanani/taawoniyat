// import React, { useEffect, useState } from 'react';
// import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
// import { ProductCard } from '@/components/ProductCard';
// import { Product, mockProducts } from '@/data/mockProducts';

// const USE_MOCK_DATA = true;

// export default function ExploreScreen() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       if (USE_MOCK_DATA) {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setProducts(mockProducts);
//       } else {
//         const response = await fetch('YOUR_BACKEND_API_URL/products/explore');
//         if (!response.ok) {
//           throw new Error('Failed to fetch products');
//         }
//         const data = await response.json();
//         setProducts(data);
//       }
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text>Error: {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.grid}>
//         {products.map((product) => (
//           <View key={product.id} style={styles.productWrapper}>
//             <ProductCard {...product} />
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   grid: {
//     padding: 16,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   productWrapper: {
//     width: '48%',
//     marginBottom: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });