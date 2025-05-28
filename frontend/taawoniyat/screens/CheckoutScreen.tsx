import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUserInfo({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        region: user.region || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!userInfo.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return false;
    }
    if (!userInfo.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!userInfo.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!userInfo.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (!userInfo.city.trim()) {
      Alert.alert('Error', 'City is required');
      return false;
    }
    if (!userInfo.region.trim()) {
      Alert.alert('Error', 'Region is required');
      return false;
    }
    return true;
  };

  const handleSaveInfo = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Call API to update user information
      const success = await authService.updateUserInfo(userInfo);

      if (success) {
        // Get cart items from AsyncStorage
        const cartData = await AsyncStorage.getItem('cartItems');
        const cartItems = cartData ? JSON.parse(cartData) : [];

        if (cartItems.length > 0) {
          // Save cart as panier in database
          const cartSaved = await authService.saveCartAsPanier(cartItems);

          if (cartSaved) {
            // Clear cart from AsyncStorage after successful save
            await AsyncStorage.removeItem('cartItems');

            Alert.alert('Success', 'Order placed successfully! Your cart has been saved and cleared.', [
              {
                text: 'OK',
                onPress: () => {
                  router.back(); // Go back to previous screen
                },
              },
            ]);
          } else {
            // Check if user is a seller (cart functionality not available)
            Alert.alert(
              'Cart Not Available',
              'Cart functionality is only available for clients. Your information has been updated successfully, but the cart could not be saved. Please register as a client to use the cart feature.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.back();
                  },
                },
              ]
            );
          }
        } else {
          Alert.alert('Success', 'Your information has been updated successfully!', [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]);
        }
      } else {
        Alert.alert('Error', 'Failed to update your information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      Alert.alert('Error', 'Failed to update your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B4513" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Delivery Information</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Please review and update your delivery information
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Full Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={userInfo.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              value={userInfo.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Phone Number *</ThemedText>
            <TextInput
              style={styles.input}
              value={userInfo.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Address *</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={userInfo.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your full address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>City *</ThemedText>
              <TextInput
                style={styles.input}
                value={userInfo.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="City"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Region *</ThemedText>
              <TextInput
                style={styles.input}
                value={userInfo.region}
                onChangeText={(value) => handleInputChange('region', value)}
                placeholder="Region"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <ThemedText style={styles.noteText}>
            Your information will be saved for future orders
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSaveInfo}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>Save & Continue</ThemedText>
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
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
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
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
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
