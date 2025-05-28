import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/services/authService';
import { ProductData } from '@/components/ProductCard';

const { width } = Dimensions.get('window');

interface EditProductScreenProps {
  productId: string;
}

export default function EditProductScreen({ productId }: EditProductScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);

  const categories = [
    'Organic Acacia Honey',
    'Organic Eucalyptus Honey',
    'Organic Wildflower Honey',
    'Raw Honey',
    'Manuka Honey',
    'Clover Honey',
    'Orange Blossom Honey',
    'Lavender Honey'
  ];

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/store/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          quantity: productData.quantity?.toString() || '',
          category: productData.category || '',
        });
        setSelectedImages(productData.images || []);
      } else {
        Alert.alert('Error', 'Failed to load product details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        // Limit total images to 5
        const totalCurrentImages = selectedImages.length + newImages.length;
        const remainingSlots = 5 - totalCurrentImages;
        const assetsToAdd = result.assets.slice(0, remainingSlots);

        setNewImages(prev => [...prev, ...assetsToAdd]);

        if (result.assets.length > remainingSlots) {
          Alert.alert('Limit Reached', `You can only add ${remainingSlots} more images. Maximum 5 images total.`);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeExistingImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity))) {
      Alert.alert('Error', 'Valid quantity is required');
      return false;
    }
    if (!formData.category.trim()) {
      Alert.alert('Error', 'Category is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const success = await authService.updateProduct(
        Number(productId),
        {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          category: formData.category,
        },
        newImages,
        selectedImages
      );

      if (success) {
        Alert.alert('Success', 'Product updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B4513" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Product</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Product Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter product name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter product description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Price ($) *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Quantity *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(value) => handleInputChange('quantity', value)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Category *</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategoryChip,
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      formData.category === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Product Images Section */}
        <View style={styles.imagesContainer}>
          <ThemedText style={styles.sectionTitle}>Product Images</ThemedText>

          {/* Main Image Display */}
          {(selectedImages.length > 0 || newImages.length > 0) ? (
            <View style={styles.mainImageContainer}>
              <Image
                source={{
                  uri: selectedImages.length > 0 ? selectedImages[0] : newImages[0]?.uri
                }}
                style={styles.mainImage}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeMainImageButton}
                onPress={() => {
                  if (selectedImages.length > 0) {
                    removeExistingImage(0);
                  } else {
                    removeNewImage(0);
                  }
                }}
              >
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
              <Ionicons name="camera-outline" size={48} color="#8B4513" />
              <ThemedText style={styles.imagePickerText}>Add Product Images</ThemedText>
              <ThemedText style={styles.imagePickerSubtext}>Up to 5 images</ThemedText>
            </TouchableOpacity>
          )}

          {/* Thumbnail Gallery */}
          {(selectedImages.length > 0 || newImages.length > 0) && (
            <View style={styles.thumbnailContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
                {/* Existing Images */}
                {selectedImages.map((image, index) => (
                  <View key={`existing-${index}`} style={styles.thumbnailItem}>
                    <Image
                      source={{ uri: image }}
                      style={[
                        styles.thumbnailImage,
                        index === 0 && selectedImages.length > 0 && styles.activeThumbnail
                      ]}
                      contentFit="cover"
                    />
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.removeThumbnailButton}
                        onPress={() => removeExistingImage(index)}
                      >
                        <Ionicons name="close-circle" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                    <View style={styles.imageTypeLabel}>
                      <ThemedText style={styles.imageTypeLabelText}>Current</ThemedText>
                    </View>
                  </View>
                ))}

                {/* New Images */}
                {newImages.map((image, index) => (
                  <View key={`new-${index}`} style={styles.thumbnailItem}>
                    <Image
                      source={{ uri: image.uri }}
                      style={[
                        styles.thumbnailImage,
                        index === 0 && selectedImages.length === 0 && styles.activeThumbnail
                      ]}
                      contentFit="cover"
                    />
                    {!(index === 0 && selectedImages.length === 0) && (
                      <TouchableOpacity
                        style={styles.removeThumbnailButton}
                        onPress={() => removeNewImage(index)}
                      >
                        <Ionicons name="close-circle" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                    <View style={[styles.imageTypeLabel, styles.newImageLabel]}>
                      <ThemedText style={styles.imageTypeLabelText}>New</ThemedText>
                    </View>
                  </View>
                ))}

                {/* Add More Images Button */}
                {(selectedImages.length + newImages.length) < 5 && (
                  <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                    <Ionicons name="add" size={24} color="#8B4513" />
                  </TouchableOpacity>
                )}
              </ScrollView>

              <ThemedText style={styles.imageCountText}>
                {selectedImages.length + newImages.length}/5 images
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>Update Product</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryChip: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  imagePickerButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DC',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    marginTop: 8,
    minHeight: 200,
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  imagePickerSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
  },
  mainImageContainer: {
    position: 'relative',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeMainImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnailScroll: {
    marginBottom: 8,
  },
  thumbnailItem: {
    position: 'relative',
    marginRight: 8,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#8B4513',
  },
  removeThumbnailButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B4513',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DC',
  },
  imageCountText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  imageTypeLabel: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newImageLabel: {
    backgroundColor: 'rgba(34, 139, 34, 0.8)',
  },
  imageTypeLabelText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
