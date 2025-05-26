import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/users';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  city: string;
  region: string;
  address: string;
  phone: string;
  businessName?: string; // Optional for sellers
  products?: Product[]; // Optional for sellers
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  sellerId: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  client?: {
    // Include client info for seller view
    id: number;
    fullName: string;
    email: string;
  }
}

export const authService = (() => {
  const USER_KEY = 'user';

  return {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${API_BASE_URL}/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.user) {
             await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
          return { success: true, message: data.message || 'Login successful', user: data.user };
        } else {
           const message = data.message || 'Authentication failed';
           console.error('Login failed:', response.status, message);
           return { success: false, message: message };
        }
      } catch (error: any) {
        console.error('Login request error:', error);
        return { success: false, message: error.message || 'Network error during login.' };
      }
    },

    logout: async (): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
        });

        if (!response.ok) {
          console.error('Backend logout failed:', response.status, await response.text());
        }

        await AsyncStorage.removeItem(USER_KEY);

        console.log('User logged out.');

      } catch (error) {
        console.error('Logout error:', error);
        await AsyncStorage.removeItem(USER_KEY);
      }
    },

    getCurrentUser: async (): Promise<User | null> => {
      try {
        const userJson = await AsyncStorage.getItem(USER_KEY);
        const localUser: User | null = userJson ? JSON.parse(userJson) : null;

        const response = await fetch(`${API_BASE_URL}/me`, {
        });

        if (response.ok) {
           const backendUser: User = await response.json();
           await AsyncStorage.setItem(USER_KEY, JSON.stringify(backendUser));
           return backendUser;
        } else if (response.status === 401) {
           console.log('Session expired or user not authenticated on backend.');
           await AsyncStorage.removeItem(USER_KEY); // Clear stale local data
           return null;
        } else {
           console.error('Failed to fetch user details from backend:', response.status, await response.text());
           return localUser; // Or throw error, depending on desired behavior
        }

      } catch (error) {
        console.error('Get current user error:', error);
        const userJson = await AsyncStorage.getItem(USER_KEY);
        return userJson ? JSON.parse(userJson) : null; // Return local data as fallback
      }
    },

    isAuthenticated: async (): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/validate-session`, {
           method: 'GET',
        });

        return response.ok; // True if status is 2xx, false otherwise (including 401)

      } catch (error) {
        console.error('Authentication check error:', error);
        return false; // Assume not authenticated on network error
      }
    },

    registerClient: async (userData: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
      region: string;
      city: string;
      address: string;
    }): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${API_BASE_URL}/register/client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        return { success: response.ok, message: data.message, user: data.user };
      } catch (error: any) {
        console.error('Register client error:', error);
        return { success: false, message: error.message || 'Network error' };
      }
    },

    registerSeller: async (userData: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
      region: string;
      city: string;
      address: string;
      businessName: string;
    }): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${API_BASE_URL}/register/seller`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        return { success: response.ok, message: data.message, user: data.user };
      } catch (error: any) {
        console.error('Register seller error:', error);
        return { success: false, message: error.message || 'Network error' };
      }
    },

    checkEmailExists: async (email: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/exists/email/${email}`);
        return response.ok ? await response.json() : false; // Assuming backend returns boolean
      } catch (error) {
        console.error('Check email error:', error);
        return false;
      }
    },

    getUserDetails: async (): Promise<User | null> => {
       try {
          const response = await fetch(`${API_BASE_URL}/me`, {
          });

          if (response.ok) {
             return await response.json();
          } else if (response.status === 401) {
             console.log('Session invalid for getUserDetails.');
             return null; // Not authenticated
          } else {
             console.error('Failed to fetch user details:', response.status, await response.text());
             return null;
          }
       } catch (error) {
          console.error('Error in getUserDetails:', error);
          return null;
       }
    },

    getSellerProducts: async (): Promise<Product[] | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/seller/products`, {
        });

        if (response.ok) {
          return await response.json();
        } else if (response.status === 401) {
           console.log('Session invalid for getSellerProducts.');
           return null; // Not authenticated
        } else {
          console.error('Failed to fetch seller products:', response.status, await response.text());
          return null; // Indicate failure
        }
      } catch (error) {
        console.error('Get seller products error:', error);
        return null; // Return null on error
      }
    },

    getClientOrders: async (): Promise<Order[] | null> => {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/me`, {
        });

        if (response.ok) {
          const orders: Order[] = await response.json();
          console.log('Fetched client orders:', orders);
          return orders;

        } else if (response.status === 401) {
           console.log('Session invalid for getClientOrders.');
           return null; // Not authenticated
        } else {
          console.error('Failed to fetch client orders:', response.status, await response.text());
          return null;
        }

      } catch (error) {
        console.error('Error fetching client orders:', error);
        return null;
      }
    },

    getSellerOrders: async (): Promise<Order[] | null> => {
      try {
         const response = await fetch(`http://localhost:8080/api/seller/orders`, {
         });

        if (response.ok) {
          const orders: Order[] = await response.json();
          console.log('Fetched seller orders:', orders);
          return orders;

        } else if (response.status === 401) {
           console.log('Session invalid for getSellerOrders.');
           return null; // Not authenticated
        } else {
          console.error('Failed to fetch seller orders:', response.status, await response.text());
          return null;
        }

      } catch (error) {
        console.error('Error fetching seller orders:', error);
        return null;
      }
    },

    addSellerProduct: async (productData: {
      name: string;
      description: string;
      price: number;
      category: string;
      quantity: number;
    }): Promise<Product | null> => {
      try {
        console.log('Sending add product request (session-based):', productData); // Log data being sent

        const response = await fetch('http://localhost:8080/store/addProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: { name: productData.category },
            quantity: productData.quantity,
          }),
        });

        console.log('Received add product response. Status:', response.status, 'OK:', response.ok); // Log response

        if (response.ok) {
          const newProduct: Product = await response.json();
          console.log('Product added successfully:', newProduct); // Log successful addition
          return newProduct; // Return the added product object

        } else if (response.status === 401) {
            console.log('Session invalid for addSellerProduct.');
            return null; // Not authenticated
        } else {
          const errorText = await response.text();
          console.error('Failed to add product:', response.status, errorText);
          return null; // Indicate failure
        }

      } catch (error) {
        console.error('Error adding product:', error);
        return null; // Return null on error
      }
    },

    uploadProductImage: async (productId: number, imageFile: File): Promise<string | null> => {
      try {
        console.log(`Uploading image for product ID (session-based): ${productId}`); // Log upload attempt

        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`http://localhost:8080/api/products/${productId}/upload-image`, {
          method: 'POST',
          headers: {
          },
          body: formData,
        });

        console.log('Received image upload response. Status:', response.status, 'OK:', response.ok); // Log response

        if (response.ok) {
          const imageUrl: string = await response.text();
          console.log('Image uploaded successfully. URL:', imageUrl); // Log successful upload
          return imageUrl; // Return the image URL

        } else if (response.status === 401) {
           console.log('Session invalid for uploadProductImage.');
           return null; // Not authenticated
        } else {
          const errorText = await response.text();
          console.error('Failed to upload image:', response.status, errorText);
          return null; // Indicate failure
        }

      } catch (error) {
        console.error('Error uploading image:', error);
        return null; // Return null on error
      }
    },

    updateSellerProduct: async (productId: number, productData: any): Promise<boolean> => {
      console.log('Placeholder for updateSellerProduct', productId, productData);
      // TODO: Implement API call
      return true; // Simulate success
    },

    deleteSellerProduct: async (productId: number): Promise<boolean> => {
      console.log('Placeholder for deleteSellerProduct', productId);
      // TODO: Implement API call
      return true; // Simulate success
    },
  };
})();