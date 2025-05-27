import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/contexts/UserContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = async () => {
    // Validate form
    if (!formData.fullName || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Clear cart after successful checkout
      await AsyncStorage.removeItem('cartItems');
      Alert.alert(
        'Success',
        'Your order has been placed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/shop')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process checkout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText variant="h2" style={styles.title}>Checkout</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <ThemedText variant="h4" style={styles.sectionTitle}>Shipping Information</ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText variant="body2" style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="body2" style={styles.label}>Address</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your address"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <ThemedText variant="body2" style={styles.label}>City</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Enter city"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <ThemedText variant="body2" style={styles.label}>Postal Code</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.postalCode}
              onChangeText={(value) => handleInputChange('postalCode', value)}
              placeholder="Enter postal code"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="body2" style={styles.label}>Phone Number</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleCheckout}
      >
        <ThemedText style={styles.checkoutButtonText}>
          Place Order
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#0a7ea4',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 