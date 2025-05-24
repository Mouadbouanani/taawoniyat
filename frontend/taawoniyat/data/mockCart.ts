import { Product } from './mockProducts';

export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
}

export const mockCart: Cart = {
  id: 1,
  items: [
    {
      id: 1,
      quantity: 2,
      price: 24.99,
      product: {
        id: '1',
        title: 'Organic Green Tea',
        description: 'Premium quality organic green tea leaves from Japan',
        price: 24.99,
        rating: 4,
        image: require('../assets/images/partial-react-logo.png'),
      }
    },
    {
      id: 2,
      quantity: 1,
      price: 19.99,
      product: {
        id: '2',
        title: 'Natural Honey',
        description: 'Raw, unfiltered honey from local beekeepers',
        price: 19.99,
        rating: 5,
        image: require('../assets/images/partial-react-logo.png'),
      }
    }
  ],
  totalAmount: 69.97
}; 