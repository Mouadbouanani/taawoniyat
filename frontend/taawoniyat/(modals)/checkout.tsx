import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export default function CheckoutScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // TODO: Implement checkout logic
      Alert.alert('Success', 'Order placed successfully!');
      router.replace('/shop');
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Checkout</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Shipping Information
        </ThemedText>
        <View style={styles.infoContainer}>
          <InfoItem icon="person-outline" label="Name" value={user?.fullName} />
          <InfoItem icon="call-outline" label="Phone" value={user?.phone} />
          <InfoItem icon="location-outline" label="Address" value={user?.address} />
          <InfoItem icon="business-outline" label="City" value={user?.city} />
          <InfoItem icon="map-outline" label="Region" value={user?.region} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Payment Method
        </ThemedText>
        <TouchableOpacity style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={24} color="#666" />
          <ThemedText style={styles.paymentText}>Cash on Delivery</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.checkoutButtonText}>
            Place Order
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={20} color="#666" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        <ThemedText style={styles.infoValue}>{value || 'Not provided'}</ThemedText>
      </View>
    </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 12,
  },
  checkoutButton: {
    backgroundColor: '#0a7ea4',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 