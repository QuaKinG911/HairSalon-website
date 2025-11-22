import { Service, Stylist } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'The Executive Cut',
    description: 'Precision scissor cut tailored to your head shape, finished with a straight razor neck shave and style.',
    price: 45,
    category: 'Haircuts',
    image: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Skin Fade',
    description: 'Seamless gradient fade from skin to length, featuring crisp line-ups and texture on top.',
    price: 50,
    category: 'Haircuts',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Traditional Hot Towel Shave',
    description: 'A relaxing straight razor shave with hot towel treatment, essential oils, and post-shave balm.',
    price: 55,
    category: 'Beard & Shave',
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed6191?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Beard Sculpt & Trim',
    description: 'Expert shaping of the beard and mustache with razor lining and conditioning oil.',
    price: 35,
    category: 'Beard & Shave',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b7f30a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'The Gentleman\'s Package',
    description: 'Our signature haircut combined with a hot towel shave or beard sculpt. The ultimate grooming experience.',
    price: 90,
    category: 'Packages',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Scalp Treatment & Massage',
    description: 'Exfoliating scalp therapy to promote hair health, accompanied by a 15-minute head massage.',
    price: 40,
    category: 'Grooming',
    image: 'https://images.unsplash.com/photo-1585747831381-a6ead42e1485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export const STYLISTS: Stylist[] = [
  {
    id: 's1',
    name: 'Marcus Thorne',
    role: 'Master Barber',
    bio: 'Marcus blends old-school barbering techniques with modern styling to create timeless looks for the modern gentleman.',
    image: 'https://images.unsplash.com/photo-1582095133179-e8747d2d11f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    specialties: ['Hot Towel Shaves', 'Precision Shear Work', 'Classic Pompadours'],
  },
  {
    id: 's2',
    name: 'James "Jax" Jackson',
    role: 'Fade Specialist',
    bio: 'Known for the sharpest line-ups in the city, Jax specializes in modern urban cuts and intricate designs.',
    image: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    specialties: ['Skin Fades', 'Hair Tattoos', 'Beard Shaping'],
  },
  {
    id: 's3',
    name: 'Leo Varas',
    role: 'Senior Stylist',
    bio: 'Leo brings 10 years of international experience, specializing in longer men\'s hairstyles and texture management.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    specialties: ['Long Hair Styling', 'Texturizing', 'Grey Blending'],
  },
];