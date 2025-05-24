import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

type ProductProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  image: string;
};

export function ProductCard({ title, description, price, rating, image }: ProductProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} contentFit="cover" />
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => setIsFavorite(!isFavorite)}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={24} 
          color={isFavorite ? "#ff4646" : "#666"} 
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
        <View style={styles.footer}>
          <ThemedText type="defaultSemiBold" style={styles.price}>
            ${price.toFixed(2)}
          </ThemedText>
          <View style={styles.rating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons 
                key={i}
                name={i < rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
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
  rating: {
    flexDirection: 'row',
    gap: 2,
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
});