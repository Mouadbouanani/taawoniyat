export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  image: any;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Organic Green Tea',
    description: 'Premium quality organic green tea leaves from Japan',
    price: 24.99,
    rating: 4,
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '2',
    title: 'Natural Honey',
    description: 'Raw, unfiltered honey from local beekeepers',
    price: 19.99,
    rating: 5,
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '3',
    title: 'Essential Oils Set',
    description: 'Pure essential oils for aromatherapy',
    price: 39.99,
    rating: 4,
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '4',
    title: 'Organic Coconut Oil',
    description: 'Cold-pressed virgin coconut oil',
    price: 15.99,
    rating: 5,
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '5',
    title: 'Herbal Tea Collection',
    description: 'Assorted organic herbal teas',
    price: 29.99,
    rating: 4,
    image: require('../assets/images/partial-react-logo.png'),
  },
  {
    id: '6',
    title: 'Natural Soap Set',
    description: 'Handmade organic soap collection',
    price: 22.99,
    rating: 4,
    image: require('../assets/images/partial-react-logo.png'),
  },
]; 