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
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { designSystem } from '@/theme/designSystem';

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
        // Get user-specific cart items from AsyncStorage
        const cartKey = user?.id ? `cartItems_${user.id}` : 'cartItems_guest';
        const cartData = await AsyncStorage.getItem(cartKey);
        const cartItems = cartData ? JSON.parse(cartData) : [];

        if (cartItems.length > 0) {
          // Save cart as panier in database
          const cartSaved = await authService.saveCartAsPanier(cartItems);

          if (cartSaved) {
            // Clear user-specific cart from AsyncStorage after successful save
            await AsyncStorage.removeItem(cartKey);

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
          <Ionicons name="arrow-back" size={24} color={designSystem.colors.primary[600]} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Checkout</Typography>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Delivery Information</Typography>
          <Typography variant="body2" style={styles.sectionSubtitle}>
            Please review and update your delivery information
          </Typography>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Typography variant="body2" style={styles.label}>Full Name *</Typography>
            <TextInput
              style={styles.input}
              value={userInfo.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={designSystem.colors.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="body2" style={styles.label}>Email *</Typography>
            <TextInput
              style={styles.input}
              value={userInfo.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={designSystem.colors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="body2" style={styles.label}>Phone Number *</Typography>
            <TextInput
              style={styles.input}
              value={userInfo.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor={designSystem.colors.neutral[400]}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="body2" style={styles.label}>Address *</Typography>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={userInfo.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your full address"
              placeholderTextColor={designSystem.colors.neutral[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Typography variant="body2" style={styles.label}>City *</Typography>
              <TextInput
                style={styles.input}
                value={userInfo.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="City"
                placeholderTextColor={designSystem.colors.neutral[400]}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Typography variant="body2" style={styles.label}>Region *</Typography>
              <TextInput
                style={styles.input}
                value={userInfo.region}
                onChangeText={(value) => handleInputChange('region', value)}
                placeholder="Region"
                placeholderTextColor={designSystem.colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color={designSystem.colors.info[500]} />
          <Typography variant="body2" style={styles.noteText}>
            Your information will be saved for future orders
          </Typography>
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
              <Typography variant="button" style={styles.saveButtonText}>Save & Continue</Typography>
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
    backgroundColor: designSystem.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.neutral[200],
    ...designSystem.shadows.sm,
  },
  backButton: {
    marginRight: designSystem.spacing.md,
    padding: designSystem.spacing.xs,
  },
  headerTitle: {
    color: designSystem.colors.neutral[800],
  },
  content: {
    flex: 1,
  },
  section: {
    padding: designSystem.spacing.md,
    backgroundColor: '#FFFFFF',
    marginBottom: designSystem.spacing.sm,
  },
  sectionTitle: {
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.xs,
  },
  sectionSubtitle: {
    color: designSystem.colors.neutral[600],
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: designSystem.spacing.md,
    marginBottom: designSystem.spacing.sm,
  },
  inputGroup: {
    marginBottom: designSystem.spacing.md,
  },
  label: {
    color: designSystem.colors.neutral[700],
    marginBottom: designSystem.spacing.xs,
    fontWeight: designSystem.typography.weights.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: designSystem.colors.neutral[300],
    borderRadius: designSystem.borderRadius.md,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.sm,
    fontSize: designSystem.typography.sizes.base,
    backgroundColor: '#FFFFFF',
    color: designSystem.colors.neutral[800],
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
    backgroundColor: designSystem.colors.info[50],
    padding: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: designSystem.colors.info[200],
  },
  noteText: {
    marginLeft: designSystem.spacing.sm,
    color: designSystem.colors.info[700],
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: designSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.neutral[200],
    ...designSystem.shadows.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designSystem.colors.primary[500],
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.lg,
    ...designSystem.shadows.md,
  },
  disabledButton: {
    backgroundColor: designSystem.colors.neutral[400],
  },
  saveButtonText: {
    color: '#FFFFFF',
    marginLeft: designSystem.spacing.sm,
  },
});
