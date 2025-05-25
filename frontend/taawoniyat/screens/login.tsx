import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'seller'>('client');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        Alert.alert('Success', 'Login successful!');
        // Navigate based on user role
        if (response.user.role === 'seller') {
          router.replace('/shop');
        } else {
          router.replace('/shop');
        }
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to the server or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title}>Welcome Back</ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'client' && styles.selectedUserType,
              ]}
              onPress={() => setUserType('client')}
            >
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'client' && styles.selectedUserTypeText,
                ]}
              >
                Client
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'seller' && styles.selectedUserType,
              ]}
              onPress={() => setUserType('seller')}
            >
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'seller' && styles.selectedUserTypeText,
                ]}
              >
                Seller
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8B4513" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8B4513"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8B4513" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#8B4513"
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8DC" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Login</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <ThemedText style={styles.registerText}>Don't have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push(userType === 'client' ? '/(auth)/client-register' : '/(auth)/seller-register')}>
              <ThemedText style={styles.registerLink}>Register</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF5E6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 32,
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  userTypeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFF8DC',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  selectedUserType: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  userTypeText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  selectedUserTypeText: {
    color: '#FFF8DC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    borderRadius: 25,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#8B4513',
  },
  loginButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFF8DC',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#8B4513',
    fontSize: 16,
  },
  registerLink: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 