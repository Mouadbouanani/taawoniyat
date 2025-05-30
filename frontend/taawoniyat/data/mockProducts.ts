export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  image: any;
  category?: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Argan Oil',
    description: 'Pure organic argan oil from the Atlas Mountains',
    price: 299.99,
    rating: 5,
    category: 'Oils',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '2',
    title: 'Ras El Hanout',
    description: 'Traditional Moroccan spice blend',
    price: 89.99,
    rating: 5,
    category: 'Spices',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '3',
    title: 'Ghassoul Clay',
    description: 'Natural rhassoul clay for hair and skin',
    price: 149.99,
    rating: 4,
    category: 'Beauty',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '4',
    title: 'Moroccan Mint Tea',
    description: 'Premium quality Moroccan green tea with mint',
    price: 79.99,
    rating: 5,
    category: 'Teas',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '5',
    title: 'Black Soap',
    description: 'Traditional Moroccan black soap (Savon Noir)',
    price: 59.99,
    rating: 4,
    category: 'Beauty',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '6',
    title: 'Rose Water',
    description: 'Pure Moroccan rose water from Dades Valley',
    price: 129.99,
    rating: 5,
    category: 'Beauty',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '7',
    title: 'Saffron',
    description: 'Premium Moroccan saffron from Taliouine',
    price: 399.99,
    rating: 5,
    category: 'Spices',
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '8',
    title: 'Honey',
    description: 'Pure wild honey from the Atlas Mountains',
    price: 199.99,
    rating: 5,
    category: 'Honey',
    image: require('../assets/images/partial-react-logo.png'),
  }
]; 