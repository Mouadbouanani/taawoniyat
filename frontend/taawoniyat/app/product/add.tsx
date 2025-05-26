import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
// Import platform to conditionally render file input
import { Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText'; // Assuming ThemedText exists
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons exists
import { useRouter } from 'expo-router'; // Assuming expo-router is used for navigation
import { authService, Product } from '@/services/authService'; // Import authService and Product interface

// Import necessary modules for image picking
import * as ImagePicker from 'expo-image-picker';

export default function AddProductScreen() {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  // Change imageUrl state to handle a File object
  const [productImage, setProductImage] = useState<any>(null); // Use `any` for now to accommodate File/Blob type
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle image picking
  const pickImage = async () => {
    // Request media library permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    // Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled) {
      // Set the selected image file. On web, result.assets[0].uri is a blob: URL
      // On native, it's a file:// URL. We need to convert to a File/Blob for fetch.
      const asset = result.assets[0];
      if (Platform.OS === 'web') {
         const response = await fetch(asset.uri);
         const blob = await response.blob();
         // Create a File object with a dummy name and the correct type
         const file = new File([blob], asset.fileName || 'upload.jpg', { type: blob.type });
         setProductImage(file);
      } else {
         // For native, asset.uri is already a file path, though we might need more
         // specific handling if backend expects a Blob/File-like structure via multipart.
         // React Native's fetch handles file:// URIs with FormData automatically.
         setProductImage({ uri: asset.uri, name: asset.fileName, type: asset.mimeType });
      }
    }
  };

  const handleAddProduct = async () => {
    // Basic validation (add image check)
    if (!productName || !description || !price || !productImage || !category || !quantity) {
      Alert.alert('Missing Fields', 'Please fill in all product details and select an image.');
      return;
    }

    const newProductData = {
      name: productName,
      description: description,
      price: parseFloat(price), // Convert price to number
      category: category, // Send category name (backend handles lookup)
      quantity: parseInt(quantity, 10), // Convert quantity to integer
    };

    setLoading(true);
    let addedProduct: Product | null = null;
    try {
      // Step 1: Add product details to get product ID
      addedProduct = await authService.addSellerProduct(newProductData);

      if (!addedProduct) {
        // Error adding product details (handled in authService, but show generic here)
        Alert.alert('Error', 'Failed to add product details. Please check backend logs.');
        return;
      }

      // Step 2: Upload image using the new product ID
      // Need to ensure the imageFile passed to uploadProductImage is in the correct format
      const imageUrl = await authService.uploadProductImage(addedProduct.id, productImage); // Pass product ID and image file

      if (!imageUrl) {
         // Handle image upload failure (backend needs to handle associating URL if upload succeeds but save fails)
         // For now, assume if upload fails, the product might be left without an image.
         // A more robust flow would handle this, maybe a separate call to link image URL.
         Alert.alert('Image Upload Failed', 'Product details saved, but failed to upload image.');
         // Optionally, delete the product details if image upload is critical
         // await authService.deleteSellerProduct(addedProduct.id);
         // return;
      }

      // If both steps were successful
      Alert.alert('Success', 'Product added successfully!');

      // Clear form
      setProductName('');
      setDescription('');
      setPrice('');
      setProductImage(null); // Clear selected image
      setCategory('');
      setQuantity('');

      // Optionally navigate back to account page or product list
      // router.back(); // Go back to previous screen
      // router.push('/account'); // Go to account page

    } catch (error) {
      console.error('Error adding product with image:', error);
      Alert.alert('Error', 'An unexpected error occurred during product creation.');
      // Consider rolling back the product creation if image upload failed
      // if (addedProduct?.id) {
      //   await authService.deleteSellerProduct(addedProduct.id);
      //   Alert.alert('Error', 'Product creation failed, details and image upload rolled back.');
      // }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>Add New Product</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
       {/* Image Picker Button */}
       <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#0a7ea4" />
          <ThemedText style={styles.imagePickerButtonText}>
             {productImage ? 'Image Selected' : 'Pick Product Image'}
          </ThemedText>
       </TouchableOpacity>
       {productImage && (
          // Display selected image preview or name
          <ThemedText style={styles.imageSelectedText}>
             {Platform.OS === 'web' ? (productImage as File).name : (productImage as { name: string }).name}
          </ThemedText>
       )}
       <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity (Stock)"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddProduct}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.addButtonText}>Add Product</ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top', // Align text to the top in Android
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  imagePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#0a7ea4',
  },
  imageSelectedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 