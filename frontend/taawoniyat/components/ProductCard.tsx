import * as React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

// Define a type for the product data structure
export type ProductData = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  quantity: number; // This is stock quantity from backend
  sellerFullName: string;
  isFavorite?: boolean; // Add optional isFavorite property
};

// Update ProductProps to use ProductData and include the onAddToCart and isFavorite/onToggleFavorite props
type ProductProps = ProductData & {
  onAddToCart: (product: ProductData) => void;
  onToggleFavorite: (product: ProductData) => void; // onToggleFavorite now accepts ProductData
  // isFavorite prop is now included in ProductData
};

export function ProductCard({ id, name, description, price, images, onAddToCart, onToggleFavorite, isFavorite, category, quantity, sellerFullName }: ProductProps) {
  // Remove internal isFavorite state
  // const [isFavorite, setIsFavorite] = useState(false);

  const imageUrl = images && images.length > 0 ? images[0] : '';

  const productToAdd = {
    id, name, description, price, images, category, quantity, sellerFullName,
    // isFavorite is not part of the data being passed back, it's managed in the parent
  };

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={imageUrl} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.placeholderImage}><ThemedText>No Image</ThemedText></View>
      )}
      <TouchableOpacity 
        style={styles.favoriteButton}
        // Call onToggleFavorite and pass the product data
        onPress={() => onToggleFavorite(productToAdd)}
      >
        <Ionicons 
          // Use the isFavorite prop to determine the icon
          name={isFavorite ? "heart" : "heart-outline"} 
          size={24} 
          color={isFavorite ? "#ff4646" : "#666"} 
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>{name}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
        <View style={styles.footer}>
          <ThemedText type="defaultSemiBold" style={styles.price}>
            ${price.toFixed(2)}
          </ThemedText>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => onAddToCart(productToAdd)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.addToCartButtonText}>Add</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    color: '#2E7D32',
  },
  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
  addToCartButton: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});