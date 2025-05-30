import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from './ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { designSystem } from '@/theme/designSystem';

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
  const router = useRouter();
  const { addToCart, getProductQuantityInCart } = useCart();

  const imageUrl = images && images.length > 0 ? images[0] : '';
  const cartQuantity = getProductQuantityInCart(id);

  const productToAdd = {
    id, name, description, price, images, category, quantity, sellerFullName,
    // isFavorite is not part of the data being passed back, it's managed in the parent
  };

  const handleProductPress = () => {
    router.push(`/(modal)/product/${id}`);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(productToAdd);
      // Also call the parent's onAddToCart for any additional logic
      onAddToCart(productToAdd);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      // Show error alert if adding to cart fails
      if (error.message) {
        alert(error.message);
      }
    }
  };

  // Limit description to 100 characters
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleProductPress}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={designSystem.colors.neutral[400]} />
            <Typography variant="caption" color={designSystem.colors.neutral[500]}>No Image</Typography>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(productToAdd);
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? designSystem.colors.error[500] : designSystem.colors.neutral[500]}
          />
        </TouchableOpacity>
        {quantity <= 5 && quantity > 0 && (
          <View style={styles.stockBadge}>
            <Typography variant="caption" color="#FFFFFF">
              {quantity} left
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Typography variant="body1" style={styles.title} numberOfLines={2}>
          {name}
        </Typography>
        <Typography variant="body2" style={styles.description} numberOfLines={2}>
          {truncateDescription(description, 80)}
        </Typography>
        {description.length > 80 && (
          <Typography variant="caption" style={styles.readMore}>
            Tap to read more...
          </Typography>
        )}
        <View style={styles.footer}>
          <Typography variant="body1" style={styles.price}>
            {price.toFixed(2)} DH
          </Typography>
          <TouchableOpacity
            style={[styles.addToCartButton, cartQuantity > 0 && styles.addToCartButtonWithQuantity]}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            {cartQuantity > 0 && (
              <View style={styles.quantityBadge}>
                <Typography variant="caption" style={styles.quantityBadgeText}>{cartQuantity}</Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: designSystem.borderRadius.lg,
    backgroundColor: '#FFFFFF',
    ...designSystem.shadows.md,
    marginBottom: designSystem.spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: designSystem.borderRadius.lg,
    borderTopRightRadius: designSystem.borderRadius.lg,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: designSystem.borderRadius.lg,
    borderTopRightRadius: designSystem.borderRadius.lg,
    backgroundColor: designSystem.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
  },
  content: {
    padding: designSystem.spacing.md,
  },
  title: {
    marginBottom: designSystem.spacing.sm,
    color: designSystem.colors.neutral[900],
    fontWeight: designSystem.typography.weights.semibold,
    lineHeight: 22,
    minHeight: 44, // Ensure consistent height for 2 lines
  },
  description: {
    color: designSystem.colors.neutral[600],
    marginBottom: designSystem.spacing.xs,
    lineHeight: 18,
    minHeight: 36, // Ensure consistent height for 2 lines
  },
  readMore: {
    color: designSystem.colors.primary[600],
    fontStyle: 'italic',
    marginBottom: designSystem.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: designSystem.spacing.sm,
  },
  price: {
    color: designSystem.colors.primary[600],
    fontWeight: designSystem.typography.weights.bold,
  },
  favoriteButton: {
    position: 'absolute',
    right: designSystem.spacing.sm,
    top: designSystem.spacing.sm,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: designSystem.borderRadius.full,
    padding: designSystem.spacing.xs,
    ...designSystem.shadows.sm,
  },
  stockBadge: {
    position: 'absolute',
    left: designSystem.spacing.sm,
    top: designSystem.spacing.sm,
    backgroundColor: designSystem.colors.warning[500],
    borderRadius: designSystem.borderRadius.md,
    paddingHorizontal: designSystem.spacing.xs,
    paddingVertical: 2,
  },
  addToCartButton: {
    backgroundColor: designSystem.colors.primary[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...designSystem.shadows.sm,
  },
  addToCartButtonWithQuantity: {
    backgroundColor: designSystem.colors.secondary[500],
  },

  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: designSystem.colors.error[500],
    borderRadius: designSystem.borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...designSystem.shadows.sm,
  },
  quantityBadgeText: {
    color: '#fff',
    fontWeight: designSystem.typography.weights.bold,
  },
});