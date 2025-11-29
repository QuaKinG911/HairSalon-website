export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Haircuts' | 'Beard & Shave' | 'Grooming' | 'Packages';
  image: string;
  duration?: string;
  note?: string;
}

export interface Stylist {
  id: string;
  name: string;
  email?: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
}

export interface AIResult {
  originalImage: string;
  processedImage: string;
  faceShape: string;
  hairType: string;
  recommendations: string[];
}

export interface FaceAnalysis {
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
  hairType: 'straight' | 'wavy' | 'curly' | 'coily';
  hairLength: 'short' | 'medium' | 'long';
  skinTone: 'fair' | 'medium' | 'tan' | 'dark';
  confidence: number;
  faceCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface HairstyleRecommendation {
  id: string;
  name: string;
  description: string;
  faceShapeMatch: number;
  hairTypeMatch: number;
  overallScore: number;
  maintenance: 'low' | 'medium' | 'high';
  occasion: 'casual' | 'business' | 'formal' | 'special';
  image: string;
  beardImage?: string;
  scale: number;
  yOffset: number;
  tags: string[];
  type?: 'hair' | 'beard' | 'combo';
}

export interface UserPreferences {
  occasion?: 'casual' | 'business' | 'formal' | 'special';
  maintenance?: 'low' | 'medium' | 'high';
  style?: 'classic' | 'modern' | 'edgy' | 'professional';
}

export interface HairstyleData {
  id: string;
  name: string;
  description: string;
  category: 'Classic' | 'Modern' | 'Professional' | 'Edgy' | 'Retro';
  faceShapeCompatibility: Record<string, number>;
  hairTypeCompatibility: Record<string, number>;
  maintenance: 'low' | 'medium' | 'high';
  occasions: string[];
  image: string;
  scale: number;
  yOffset: number;
  tags: string[];
}

export interface BeardData {
  id: string;
  name: string;
  description: string;
  faceShapeCompatibility: Record<string, number>;
  maintenance: 'low' | 'medium' | 'high';
  image: string;
  tags: string[];
}

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  phone?: string;
  saved_styles?: HairstyleRecommendation[];
}

export interface Message {
  id: string;
  sender_id: number;
  recipient_id: number;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
}