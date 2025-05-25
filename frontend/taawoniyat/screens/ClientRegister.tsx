// import React from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';

// interface ClientRegisterData {
//   fullName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   region: string;
//   city: string;
//   address: string;
// }

// interface User {
//   id: number;
//   fullName: string;
//   email: string;
//   phone: string;
//   region: string;
//   city: string;
//   address: string;
//   role: string;
// }

// interface ClientRegisterProps {
//   isLoading: boolean;
//   setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
//   setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
//   handleRegister: (userData: Omit<ClientRegisterData, 'confirmPassword'>) => Promise<void>;
//   registerData: ClientRegisterData;
//   setRegisterData: React.Dispatch<React.SetStateAction<ClientRegisterData>>;
// }

// const ClientRegister: React.FC<ClientRegisterProps> = ({
//   isLoading,
//   setIsLoading,
//   setIsLogin,
//   handleRegister,
//   registerData,
//   setRegisterData,
// }) => {
//   const API_BASE_URL = 'http://192.168.56.1:8080/api/users';

//   const onRegister = async () => {
//     if (
//       !registerData.fullName ||
//       !registerData.email ||
//       !registerData.password ||
//       !registerData.phone ||
//       !registerData.region ||
//       !registerData.city ||
//       !registerData.address
//     ) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }
        
//     if (registerData.password !== registerData.confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     setIsLoading(true);

//   const userData: Omit<ClientRegisterData, 'confirmPassword'> = {
//   fullName: registerData.fullName,
//   email: registerData.email,
//   password: registerData.password,
//   phone: registerData.phone,
//   region: registerData.region,
//   city: registerData.city,
//   address: registerData.address,
// };


//     try {
//       const emailCheckResponse = await fetch(`${API_BASE_URL}/exists/email/${registerData.email}`);
//       const emailExists = await emailCheckResponse.json();

//       if (emailExists) {
//         Alert.alert('Error', 'Email already exists. Please use a different email.');
//         setIsLoading(false);
//         return;
//       }

//       await handleRegister(userData);
//     } catch (error) {
//       console.error('Registration error:', error);
//       Alert.alert('Error', 'Registration failed. Please check your connection and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.formContainer}>
//       <Text style={styles.title}>Create Account</Text>
//       <Text style={styles.subtitle}>Join us today as a Client</Text>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Full Name *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your full name"
//           value={registerData.fullName}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, fullName: text }))}
//           autoFocus={true}
//           editable={!isLoading}
//         />
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Email *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your email"
//           value={registerData.email}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, email: text }))}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           editable={!isLoading}
//         />
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Phone *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your phone number"
//           value={registerData.phone}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, phone: text }))}
//           keyboardType="phone-pad"
//           editable={!isLoading}
//         />
//       </View>
//       <View style={styles.row}>
//         <View style={[styles.inputContainer, styles.halfWidth]}>
//           <Text style={styles.label}>Region *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Region"
//             value={registerData.region}
//             onChangeText={(text) => setRegisterData((prev) => ({ ...prev, region: text }))}
//             editable={!isLoading}
//           />
//         </View>
//         <View style={[styles.inputContainer, styles.halfWidth]}>
//           <Text style={styles.label}>City *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="City"
//             value={registerData.city}
//             onChangeText={(text) => setRegisterData((prev) => ({ ...prev, city: text }))}
//             editable={!isLoading}
//           />
//         </View>
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Address *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your address"
//           value={registerData.address}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, address: text }))}
//           editable={!isLoading}
//         />
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Password *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your password"
//           value={registerData.password}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, password: text }))}
//           secureTextEntry
//           editable={!isLoading}
//         />
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Confirm Password *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Confirm your password"
//           value={registerData.confirmPassword}
//           onChangeText={(text) => setRegisterData((prev) => ({ ...prev, confirmPassword: text }))}
//           secureTextEntry
//           editable={!isLoading}
//         />
//       </View>
//       <TouchableOpacity
//         style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
//         onPress={onRegister}
//         disabled={isLoading}
//       >
//         {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Register as Client</Text>}
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.linkButton} onPress={() => setIsLogin(true)} disabled={isLoading}>
//         <Text style={styles.linkText}>Already have an account? Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   formContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 32,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#fafafa',
//     color: '#333',
//   },
//   row: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   halfWidth: {
//     flex: 1,
//   },
//   primaryButton: {
//     backgroundColor: '#007bff',
//     borderRadius: 8,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   primaryButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   linkButton: {
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   linkText: {
//     color: '#007bff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default ClientRegister;