export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Haircuts' | 'Beard & Shave' | 'Grooming' | 'Packages';
  image: string;
}

export interface Stylist {
  id: string;
  name: string;
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