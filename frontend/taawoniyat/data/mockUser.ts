export interface User {
  id: number;
  fullName: string;
  email: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  role: 'client' | 'seller' | 'admin';
}

export const mockUser: User = {
  id: 1,
  fullName: 'John Doe',
  email: 'john@example.com',
  region: 'Casablanca',
  city: 'Casablanca',
  address: '123 Main St',
  phone: '+212 600000000',
  role: 'client'
}; 