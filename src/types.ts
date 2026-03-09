export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string; // <--- NEW FIELD
  role: UserRole;
  bio?: string;
  preferred_lang?: string;
  isBanned?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: 'Weapon' | 'Armor' | 'Artifact' | 'Consumable';
  stock_quantity: number; 
}

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  date: string; 
  likes: number;
  commentsCount: number;
  tags: string[];
  liked_by: string[];
  image_url?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  parent_id?: string | null;
  timestamp: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  prize: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  external_link?: string;
}

export interface OrderData {
  id?: string;
  userId: string;
  customerName: string;
  items: any[];
  totalGold: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
}

export enum RoutePath {
  Home = '/',
  Community = '/community',
  Shop = '/shop',
  Tournaments = '/tournaments',
  TournamentDetails = '/tournaments/:id',
  ProductDetails = '/product/:id',
  PostDetails = '/post/:id',
  Login = '/login',
  Register = '/register',
  Admin = '/hand-of-the-king',
  Checkout = '/checkout',
  Orders = '/inventory',
  About = '/about',
  Contact = '/contact',
  Profile = '/profile'
}