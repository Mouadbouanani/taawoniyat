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
  token?: string;
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
  const TOKEN_KEY = 'auth_token';

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('JWT Token available:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

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
          if (data.token) {
             await AsyncStorage.setItem(TOKEN_KEY, data.token);
          }
          return { success: true, message: data.message || 'Login successful', user: data.user, token: data.token };
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
        // Get current user before clearing data
        const userJson = await AsyncStorage.getItem(USER_KEY);
        const currentUser = userJson ? JSON.parse(userJson) : null;

        const response = await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
        });

        if (!response.ok) {
          console.error('Backend logout failed:', response.status, await response.text());
        }

        // Clear user authentication data
        await AsyncStorage.removeItem(USER_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);

        // Clear user-specific cart and favorites data
        if (currentUser) {
          await AsyncStorage.removeItem(`cartItems_${currentUser.id}`);
          await AsyncStorage.removeItem(`favoriteProducts_${currentUser.id}`);
          console.log(`Cleared user-specific data for user ${currentUser.id}`);
        }

        console.log('User logged out and data cleared.');

      } catch (error) {
        console.error('Logout error:', error);
        await AsyncStorage.removeItem(USER_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    },

    getCurrentUser: async (): Promise<User | null> => {
      try {
        const userJson = await AsyncStorage.getItem(USER_KEY);
        const localUser: User | null = userJson ? JSON.parse(userJson) : null;

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers
        });

        if (response.ok) {
           const backendUser: User = await response.json();
           await AsyncStorage.setItem(USER_KEY, JSON.stringify(backendUser));
           return backendUser;
        } else if (response.status === 401) {
           console.log('Token expired or user not authenticated on backend.');
           await AsyncStorage.removeItem(USER_KEY);
           await AsyncStorage.removeItem(TOKEN_KEY);
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
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
          return false;
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me`, {
           method: 'GET',
           headers
        });

        if (response.status === 401) {
          // Token is invalid, clear it
          await AsyncStorage.removeItem(TOKEN_KEY);
          await AsyncStorage.removeItem(USER_KEY);
          return false;
        }

        return response.ok; // True if status is 2xx, false otherwise

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



    addSellerProduct: async (productData: {
      name: string;
      description: string;
      price: number;
      category: string;
      quantity: number;
    }): Promise<Product | null> => {
      try {
        console.log('Sending add product request (session-based):', productData); // Log data being sent

        const response = await fetch('http://localhost:8080/store/addProductSimple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
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

    deleteSellerProduct: async (productId: number, productName?: string): Promise<boolean> => {
      try {
        console.log(`=== STARTING DELETE PROCESS ===`);
        console.log(`Product ID: ${productId}`);
        console.log(`Product Name: ${productName}`);

        const headers = await getAuthHeaders();
        console.log('Headers prepared:', !!headers.Authorization);

        // Always try JWT first if token is available
        if (headers.Authorization) {
          console.log('Attempting JWT-authenticated delete...');
          const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
            method: 'DELETE',
            headers: headers,
          });

          console.log('JWT delete response status:', response.status);

          if (response.ok) {
            console.log('✅ Product deleted successfully via JWT');
            return true;
          } else {
            const errorText = await response.text();
            console.error('❌ JWT delete failed:', response.status, errorText);
          }
        }

        // Fallback to session-based delete using product name
        if (productName) {
          console.log('Trying session-based delete with product name...');
          const sessionResponse = await fetch(`http://localhost:8080/store/deleteProductByName/${encodeURIComponent(productName)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Session delete response status:', sessionResponse.status);

          if (sessionResponse.ok) {
            console.log('✅ Product deleted successfully via session');
            return true;
          } else {
            const errorText = await sessionResponse.text();
            console.error('❌ Session delete failed:', errorText);
          }
        } else {
          console.log('❌ No product name provided for session-based delete');
        }

        return false;
      } catch (error) {
        console.error('❌ Delete process error:', error);
        return false;
      }
    },

    // Update user information
    updateUserInfo: async (userInfo: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      region: string;
    }): Promise<boolean> => {
      try {
        console.log('Updating user information:', userInfo);

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return false;
        }

        const response = await fetch('http://localhost:8080/api/users/update-info', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });

        console.log('Update user info response status:', response.status);

        if (response.ok) {
          console.log('User information updated successfully');
          return true;
        } else {
          const errorText = await response.text();
          console.error('Failed to update user information:', errorText);
          return false;
        }
      } catch (error) {
        console.error('Error updating user information:', error);
        return false;
      }
    },

    // New JWT-authenticated method for adding products with images
    addProductWithImages: async (productData: {
      name: string;
      description: string;
      price: number;
      category: string;
      quantity: number;
    }, images?: File[]): Promise<Product | null> => {
      try {
        console.log('Adding product with images using JWT authentication:', productData);

        const headers = await getAuthHeaders();
        const formData = new FormData();

        // Add product data
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('category', productData.category);
        formData.append('quantity', productData.quantity.toString());

        // Add images if provided
        if (images && images.length > 0) {
          images.forEach((image) => {
            formData.append('images', image);
          });
          console.log(`Adding ${images.length} images to the request`);
        }

        const response = await fetch('http://localhost:8080/api/products/add-with-images-jwt', {
          method: 'POST',
          headers: {
            // Don't set Content-Type for FormData, let the browser set it with boundary
            'Authorization': headers.Authorization || ''
          },
          body: formData,
        });

        console.log('Add product with images response. Status:', response.status, 'OK:', response.ok);

        if (response.ok) {
          const newProduct: Product = await response.json();
          console.log('Product added successfully with images:', newProduct);
          return newProduct;
        } else if (response.status === 401) {
          console.log('Token invalid for addProductWithImages.');
          await AsyncStorage.removeItem(TOKEN_KEY);
          await AsyncStorage.removeItem(USER_KEY);
          return null;
        } else {
          const errorText = await response.text();
          console.error('Failed to add product with images:', response.status, errorText);
          return null;
        }
      } catch (error) {
        console.error('Add product with images error:', error);
        return null;
      }
    },

    // Get seller products using JWT authentication
    getSellerProducts: async (): Promise<Product[]> => {
      try {
        console.log('Fetching seller products...');

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return [];
        }

        const response = await fetch('http://localhost:8080/api/users/seller/products-jwt', {
          method: 'GET',
          headers: headers,
        });

        console.log('Get seller products response status:', response.status);

        if (response.ok) {
          const products = await response.json();
          console.log('Seller products fetched successfully:', products.length);
          return products;
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch seller products:', errorText);
          return [];
        }
      } catch (error) {
        console.error('Error fetching seller products:', error);
        return [];
      }
    },



    // Get client orders using JWT authentication
    getClientOrders: async (): Promise<Order[]> => {
      try {
        console.log('Fetching client orders...');

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return [];
        }

        const response = await fetch('http://localhost:8080/api/panier/client-orders', {
          method: 'GET',
          headers: headers,
        });

        console.log('Get client orders response status:', response.status);

        if (response.ok) {
          const orders = await response.json();
          console.log('Client orders fetched successfully:', orders.length);
          return orders;
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch client orders:', errorText);
          return [];
        }
      } catch (error) {
        console.error('Error fetching client orders:', error);
        return [];
      }
    },

    // Update product with new information and images
    updateProduct: async (
      productId: number,
      productData: {
        name: string;
        description: string;
        price: number;
        quantity: number;
        category: string;
      },
      newImages: any[],
      existingImages: string[]
    ): Promise<boolean> => {
      try {
        console.log('Updating product:', productId, productData);

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return false;
        }

        const formData = new FormData();

        // Add basic product data
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('quantity', productData.quantity.toString());
        formData.append('category', productData.category);

        // Debug: Log what we're sending
        console.log('FormData contents:');
        console.log('- name:', productData.name);
        console.log('- description:', productData.description);
        console.log('- price:', productData.price.toString());
        console.log('- quantity:', productData.quantity.toString());
        console.log('- category:', productData.category);

        // Add existing images URLs
        existingImages.forEach((imageUrl, index) => {
          formData.append('existingImages', imageUrl);
          console.log(`- existingImages[${index}]:`, imageUrl);
        });

        // Add new images - process them properly for web
        for (let i = 0; i < newImages.length; i++) {
          const image = newImages[i];
          if (image.uri && image.uri.startsWith('blob:')) {
            // For web, convert blob URL to File
            try {
              const response = await fetch(image.uri);
              const blob = await response.blob();
              const file = new File([blob], image.fileName || `image_${i}.jpg`, {
                type: image.type || 'image/jpeg'
              });
              formData.append('newImages', file);
              console.log(`- newImages[${i}]:`, file.name, file.type, file.size, 'bytes');
            } catch (error) {
              console.error('Error processing image blob:', error);
            }
          } else {
            // For React Native, use the existing format
            const imageFile = {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `image_${i}.jpg`,
            };
            formData.append('newImages', imageFile as any);
            console.log(`- newImages[${i}]:`, imageFile.name, imageFile.type);
          }
        }

        console.log('Sending FormData with product data and', newImages.length, 'new images,', existingImages.length, 'existing images');

        // Remove Content-Type from headers for FormData - let browser set it automatically
        const { 'Content-Type': _, ...formDataHeaders } = headers;

        const response = await fetch(`http://localhost:8080/api/products/update/${productId}`, {
          method: 'PUT',
          headers: formDataHeaders,
          body: formData,
        });

        console.log('Update product response status:', response.status);

        if (response.ok) {
          console.log('Product updated successfully');
          return true;
        } else {
          const errorText = await response.text();
          console.error('Failed to update product:', errorText);
          return false;
        }
      } catch (error) {
        console.error('Error updating product:', error);
        return false;
      }
    },

    // Save cart items as panier in database
    saveCartAsPanier: async (cartItems: any[]): Promise<boolean> => {
      try {
        console.log('Saving cart as panier:', cartItems);

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return false;
        }

        // Transform cart items to panier format
        const panierItems = cartItems.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity || item.quantity || 1,
          price: item.price
        }));

        const response = await fetch('http://localhost:8080/api/panier/save-cart', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: panierItems }),
        });

        console.log('Save cart response status:', response.status);

        if (response.ok) {
          console.log('Cart saved as panier successfully');
          return true;
        } else {
          const errorText = await response.text();
          console.error('Failed to save cart as panier:', errorText);
          return false;
        }
      } catch (error) {
        console.error('Error saving cart as panier:', error);
        return false;
      }
    },

    // Get seller orders (for sellers to see orders containing their products)
    getSellerOrders: async (): Promise<any[]> => {
      try {
        console.log('Fetching seller orders...');

        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authentication token available');
          return [];
        }

        const response = await fetch('http://localhost:8080/api/panier/seller-orders', {
          method: 'GET',
          headers: headers,
        });

        console.log('Get seller orders response status:', response.status);

        if (response.ok) {
          const orders = await response.json();
          console.log('Seller orders fetched successfully:', orders.length, 'orders');
          return orders;
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch seller orders:', errorText);
          return [];
        }
      } catch (error) {
        console.error('Error fetching seller orders:', error);
        return [];
      }
    },
  };
})();