export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  city: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  register: (username: string, email: string, password: string, phone: string, address: string, country: string, state: string, city: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  sellerId: string;
  sellerUsername: string;
  sellerPhone?: string;
  sellerCountry: string;
  sellerState: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  price: number;
  buyerId: string;
  sellerId: string;
  purchasedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}
