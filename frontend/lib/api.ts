import { supabase } from './supabaseClient';
import { getProducts as getSupabaseProducts, Product as SupabaseProduct } from './supabase';

export type ProductCategory = 'COSMETICS' | 'HAIR';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  gallery: string[];
  isSoldOut: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  featuredImageUrl: string;
  gallery: string[];
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
  createdAt: string;
}

export interface CareerApplication {
  fullName: string;
  email: string;
  portfolio: string;
  coverLetter: string;
}

export interface WaitlistSignup {
  email: string;
}

export interface CreatePartnershipInquiryDto {
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
}

export interface HomeData {
  cosmetics: Product[];
  hair: Product[];
  posts: Post[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  featuredImageUrl: string;
  gallery: string[];
  slug: string;
}

// Helper to build Supabase image URLs
const getSupabaseImageUrl = (filename: string) =>
  `https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/product-images/${filename}`;

// MOCK DATA
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Premium Grooming Kit',
    description: 'Complete luxury grooming kit...',
    price: 299.99,
    imageUrl: getSupabaseImageUrl('cosmetic_kit1.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ... other mock products
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    slug: 'grooming-essentials',
    title: 'Essential Grooming Tips for Modern Men',
    content: 'Discover the secrets...',
    featuredImageUrl: '/images/grooming_kit.jpeg',
    excerpt: 'A comprehensive guide...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_HOME_DATA: HomeData = {
  cosmetics: MOCK_PRODUCTS.filter(p => p.category === 'COSMETICS'),
  hair: MOCK_PRODUCTS.filter(p => p.category === 'HAIR'),
  posts: MOCK_POSTS,
};

// Convert SupabaseProduct → Product
const mapSupabaseProductToAPIProduct = (p: SupabaseProduct): Product => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  price: p.price || 0,
  category: p.category === 'cosmetics' ? 'COSMETICS' : 'HAIR',
  imageUrl: p.main_image_url || '',
  gallery: p.gallery_urls || [],
  isSoldOut: !p.in_stock,
  tags: [],
  createdAt: p.created_at || new Date().toISOString(),
  updatedAt: p.updated_at || new Date().toISOString(),
});

// PRODUCTS
export async function getProducts(): Promise<Product[]> {
  const supabaseProducts = await getSupabaseProducts();
  return supabaseProducts.map(mapSupabaseProductToAPIProduct);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabaseProducts = await getSupabaseProducts();
  const target = category === 'COSMETICS' ? 'cosmetics' : 'hair-extension';
  return supabaseProducts
    .filter(p => p.category === target)
    .map(mapSupabaseProductToAPIProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// POSTS
export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, post: Partial<Post>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

// INQUIRIES & FORMS
export async function submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<void> {
  const { error } = await supabase.from('partnership_inquiries').insert([data]);
  if (error) throw error;
}

export async function submitCareerApplication(data: CareerApplication): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Career application submitted:', data);
}

export async function submitWaitlistSignup(data: WaitlistSignup): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Waitlist signup submitted:', data);
}

// MAIN API EXPORT
export const api = {
  async getProducts() {
    return await getProducts();
  },
  async getProductsByCategory(category: ProductCategory) {
    return await getProductsByCategory(category);
  },
  async getProduct(id: string) {
    return await getProduct(id);
  },
  async getPosts() {
    return await getPosts();
  },
  async getPost(slug: string) {
    const posts = await getPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
  },
  async createPost(data: CreatePostDto) {
    return await createPost(data);
  },
  async getHomeData(): Promise<HomeData> {
    const [cosmetics, hair, posts] = await Promise.all([
      getProductsByCategory('COSMETICS'),
      getProductsByCategory('HAIR'),
      getPosts(),
    ]);
    return { cosmetics, hair, posts };
  },
  async submitPartnershipInquiry(data: CreatePartnershipInquiryDto) {
    await submitPartnershipInquiry(data);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
    };
  },
};
