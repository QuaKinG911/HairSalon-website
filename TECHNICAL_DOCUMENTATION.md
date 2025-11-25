# Hair Salon Application - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [Data Models](#data-models)
6. [AI Face Analysis System](#ai-face-analysis-system)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Diagrams](#diagrams)

---

## System Overview

**Luxe Barber** is a full-stack web application for a premium barbershop that provides:
- Online booking system with real-time availability
- AI-powered hairstyle recommendations based on face analysis
- Multi-role authentication (Customer, Barber, Admin)
- Service catalog and barber profiles
- Booking management dashboard for staff

**Development Methodology**: Agile (Sprint-based development with iterative improvements)

---

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React SPA)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │ Context  │  │ Services │  │Components│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST
┌────────────────────────▼────────────────────────────────────┐
│                    SERVER LAYER (Express.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Controllers│ │Middleware│  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
┌────────────────────────▼────────────────────────────────────┐
│                   DATA LAYER (PostgreSQL)                    │
│         Users | Services | Bookings | Messages              │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Pattern: **Component-Based with Context API**

**File Structure:**
```
src/
├── pages/               # Route components (Home, Services, Booking, etc.)
├── components/          # Reusable UI components (Navbar, Footer, etc.)
├── context/            # Global state management (Auth, Booking)
├── services/           # Business logic (AI analysis, overlays)
├── utils/              # Helper functions
├── constants.ts        # Static data (services, hairstyles, beards)
└── types.ts            # TypeScript interfaces
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library for component-based architecture |
| **TypeScript** | 5.8.2 | Type safety and better developer experience |
| **React Router** | 7.9.6 | Client-side routing (SPA navigation) |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS framework |
| **Vite** | 6.2.0 | Fast build tool and dev server |
| **Lucide React** | 0.554.0 | SVG icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime |
| **Express.js** | 4.18.2 | Web application framework |
| **PostgreSQL** | - | Relational database |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **nodemailer** | 7.0.10 | Email notifications |
| **multer** | 1.4.5 | File upload handling |
| **node-schedule** | 2.1.1 | Cron jobs for reminders |

### Development Tools
- **Nodemon**: Auto-restart server on changes
- **Concurrently**: Run frontend and backend simultaneously
- **PostCSS + Autoprefixer**: CSS processing

---

## Core Components

### 1. Pages (Routes)

#### **Public Pages**
- `Home.tsx` - Landing page with hero section and overview
- `Services.tsx` - Service catalog display
- `Stylists.tsx` - Barber team profiles
- `Contact.tsx` - Contact form
- `Login.tsx` - Authentication
- `SignUp.tsx` - User registration

#### **Customer Dashboard**
- `customer/Dashboard.tsx` - Booking history and profile
- `customer/Profile.tsx` - Account settings

#### **Barber Dashboard**
- `barber/Dashboard.tsx` - Tabbed interface with:
  - Overview: Daily stats
  - Bookings: Appointment management
  - Messages: Customer inquiries
  - Schedule: Calendar view

#### **Admin Dashboard**
- `admin/Dashboard.tsx` - Tabbed interface with:
  - Overview: System analytics
  - Services: CRUD operations
  - Barbers: Staff management
  - Messages: Customer support

#### **Special Features**
- `AITryOn.tsx` - AI face analysis and hairstyle recommendations
- `Booking.tsx` - Multi-step booking flow

---

### 2. Context Providers (Global State)

#### **AuthContext.tsx**
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<void>;
  isAuthenticated: boolean;
}
```
**Responsibilities:**
- JWT token management (localStorage)
- User session persistence
- Role-based access control
- Protected route wrapper (`ProtectedRoute`)

#### **BookingContext.tsx**
```typescript
interface BookingContextType {
  cart: Service[];
  selectedStylist: Stylist | null;
  selectedDate: string | null;
  selectedTime: string | null;
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  setBookingDetails: (stylist, date, time) => void;
}
```
**Responsibilities:**
- Shopping cart for services
- Booking wizard state
- Temporary booking data before confirmation

---

### 3. Services (Business Logic)

#### **aiService.ts** - Face Analysis & Recommendations

**Algorithm: Sequential Feature Detection**

```
┌─────────────────────────────────────────────────────────────┐
│                   FACE ANALYSIS PIPELINE                     │
└─────────────────────────────────────────────────────────────┘

Step 1: FACE DETECTION
├─ Scan image pixels
├─ Identify skin pixels using RGB color formula:
│  (R > 95) && (G > 40) && (B > 20) && 
│  (max(R,G,B) - min(R,G,B) > 15) && 
│  (|R-G| > 15) && (R > G) && (R > B)
└─ Calculate bounding box (minX, minY, maxX, maxY)

Step 2: FACIAL FEATURE ANALYSIS
├─ Measure face width at 3 levels:
│  - Forehead (25% from top)
│  - Cheekbones (50% from top)
│  - Jawline (85% from top)
├─ Calculate aspect ratio (height/width)
└─ Determine face shape:
   ├─ Square: Strong jaw (jawWidth ≈ foreheadWidth)
   ├─ Round: Width ≈ Height, soft jaw
   ├─ Oval: Height > Width, balanced proportions
   ├─ Heart: Wide forehead, narrow chin
   └─ Diamond: Prominent cheekbones

Step 3: HAIR ANALYSIS
├─ Analyze region ABOVE face (50% extension)
├─ Edge Detection: Count rapid pixel changes
├─ Color Variance: Detect light/dark patterns (curls)
├─ Combine scores: curlScore = (texture × 0.6) + (variance × 0.4)
└─ Classify:
   ├─ Coily: curlScore > 0.25
   ├─ Curly: curlScore > 0.15
   ├─ Wavy: curlScore > 0.08
   └─ Straight: curlScore ≤ 0.08

Step 4: SKIN TONE ANALYSIS
├─ Sample center of face (10% radius)
├─ Convert RGB to HSL color space
├─ Extract lightness (L) value
└─ Classify:
   ├─ Fair: L > 70%
   ├─ Medium: L > 50%
   ├─ Tan: L > 35%
   └─ Dark: L ≤ 35%

Step 5: RECOMMENDATION ENGINE
├─ Score ALL 20 hairstyles:
│  overallScore = (faceShapeScore × 0.6) + (hairTypeScore × 0.4)
├─ Score ALL 10 beards: faceShapeScore
├─ Filter by user preferences (maintenance, occasion)
├─ Sort by score (descending)
└─ Return top 3 haircuts + top 3 beards + best combo
```

**Key Functions:**
- `analyzeFace(imageData)` → FaceAnalysis
- `getHairstyleRecommendations(analysis, preferences)` → Recommendations[]

#### **overlayService.ts** - Virtual Try-On
- Canvas-based image overlay system
- Hairstyle image positioning and scaling
- Real-time preview generation

---

## Data Models

### TypeScript Interfaces

```typescript
// User & Authentication
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'barber' | 'admin';
  preferences?: UserPreferences;
}

// Services
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: 'Haircuts' | 'Grooming' | 'Beard & Shave' | 'Packages';
  image: string;
}

// Hairstyles (AI Dataset)
interface HairstyleData {
  id: string;
  name: string;
  description: string;
  category: 'Classic' | 'Modern' | 'Professional' | 'Edgy' | 'Retro';
  faceShapeCompatibility: {
    oval: number;    // 0-100 score
    round: number;
    square: number;
    heart: number;
    diamond: number;
  };
  hairTypeCompatibility: {
    straight: number; // 0-100 score
    wavy: number;
    curly: number;
    coily: number;
  };
  maintenance: 'low' | 'medium' | 'high';
  occasions: string[]; // ['casual', 'business', 'formal', 'creative']
  image: string;
  scale: number;    // For overlay positioning
  yOffset: number;
  tags: string[];
}

// Bookings
interface Booking {
  id: string;
  userId: string;
  stylistId: string;
  serviceIds: string[];
  date: string; // ISO format
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// Face Analysis Results
interface FaceAnalysis {
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
  hairType: 'straight' | 'wavy' | 'curly' | 'coily';
  hairLength: 'short' | 'medium' | 'long';
  skinTone: 'fair' | 'medium' | 'tan' | 'dark';
  confidence: number; // 0-1
  faceCoordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    USERS     │         │   SERVICES   │         │  STYLISTS    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ email (UQ)   │         │ name         │         │ name         │
│ password     │         │ description  │         │ role         │
│ name         │         │ price        │         │ bio          │
│ phone        │         │ duration     │         │ image        │
│ role         │         │ category     │         │ specialties  │
│ created_at   │         │ image        │         └──────────────┘
└──────┬───────┘         └──────────────┘                │
       │                                                  │
       │                                                  │
       │           ┌──────────────┐                      │
       └──────────▶│   BOOKINGS   │◀─────────────────────┘
                   ├──────────────┤
                   │ id (PK)      │
                   │ user_id (FK) │
                   │ stylist_id   │
                   │ service_ids  │
                   │ date         │
                   │ time         │
                   │ status       │
                   │ total_price  │
                   │ created_at   │
                   └──────────────┘
```

### PostgreSQL Tables

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stylist_id INTEGER NOT NULL,
  service_ids TEXT[], -- Array of service IDs
  date DATE NOT NULL,
  time VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication & Authorization

### JWT-Based Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Express │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /auth/login         │                          │
     │ {email, password}        │                          │
     ├─────────────────────────▶│                          │
     │                          │ SELECT * FROM users      │
     │                          │ WHERE email = ?          │
     │                          ├─────────────────────────▶│
     │                          │                          │
     │                          │◀─────────────────────────┤
     │                          │ User data                │
     │                          │                          │
     │                          │ bcrypt.compare()         │
     │                          │ (password validation)    │
     │                          │                          │
     │                          │ jwt.sign()               │
     │                          │ (generate token)         │
     │                          │                          │
     │◀─────────────────────────┤                          │
     │ { token, user }          │                          │
     │                          │                          │
     │ Store token in           │                          │
     │ localStorage             │                          │
     │                          │                          │
     │ GET /api/bookings        │                          │
     │ Header: Authorization:   │                          │
     │ Bearer <token>           │                          │
     ├─────────────────────────▶│                          │
     │                          │ jwt.verify(token)        │
     │                          │                          │
     │                          │ Protected data           │
     │◀─────────────────────────┤                          │
     │                          │                          │
```

### Role-Based Access Control

| Route | Customer | Barber | Admin |
|-------|----------|--------|-------|
| `/` (Home) | ✅ | ✅ | ✅ |
| `/booking` | ✅ | ✅ | ✅ |
| `/customer/dashboard` | ✅ | ❌ | ❌ |
| `/barber/dashboard` | ❌ | ✅ | ❌ |
| `/admin/dashboard` | ❌ | ❌ | ✅ |

**Implementation:** `ProtectedRoute` component wraps restricted routes and checks `user.role`.

---

## API Endpoints

### Authentication
```
POST   /auth/signup         Create new user account
POST   /auth/login          Authenticate and get JWT token
GET    /auth/verify         Verify token validity
```

### Bookings
```
GET    /api/bookings        Get all bookings (filtered by role)
POST   /api/bookings        Create new booking
PUT    /api/bookings/:id    Update booking status
DELETE /api/bookings/:id    Cancel booking
```

### Messages
```
GET    /api/messages        Get all contact form submissions
POST   /api/messages        Submit contact form
PUT    /api/messages/:id    Mark message as read
DELETE /api/messages/:id    Delete message
```

### Users
```
GET    /api/users           Get all users (admin only)
GET    /api/users/:id       Get user profile
PUT    /api/users/:id       Update user profile
```

---

## State Management Flow

### Booking Flow (Use Case Diagram)

```
Customer Journey: From browsing to confirmed booking

1. Browse Services (services page)
   │
   ├─ Click "Book Now" → Add service to cart (BookingContext)
   │
2. Optionally use AI Try-On
   │
   ├─ Upload photo → Face analysis → Get recommendations
   ├─ Select recommended style → Add to cart
   │
3. Go to Booking Page
   │
   ├─ Review cart items
   ├─ Select barber (from STYLISTS constant)
   ├─ Choose date (calendar picker)
   ├─ Choose time (available slots)
   │
4. Confirm Booking
   │
   ├─ POST /api/bookings → Database
   ├─ Email notification sent (nodemailer)
   │
5. Booking Confirmation
   │
   └─ Redirect to Dashboard → View upcoming appointments
```

### Admin Workflow (State Diagram)

```
Admin Dashboard States

[Login] ──authenticated──▶ [Overview Tab]
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   [Services Tab]      [Barbers Tab]       [Messages Tab]
         │                    │                    │
    Add/Edit/Delete      Add/Edit/Delete      Read/Archive
    Services             Barbers              Messages
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                         [Logout] ──▶ [Login]
```

---

## AI System Data Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     INPUT: User Selfie                        │
│                    (Base64 Image Data)                        │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              PREPROCESSING: Image Analysis                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Resize to MAX_WIDTH=500px                        │    │
│  │ 2. Convert to Canvas                                │    │
│  │ 3. Extract pixel array (Uint8ClampedArray)          │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│            FEATURE EXTRACTION: Skin Segmentation              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ For each pixel (R, G, B):                           │    │
│  │   if isSkinPixel() → mark as face region            │    │
│  │ Calculate bounding box (x, y, width, height)        │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│          FEATURE ANALYSIS: Geometric Measurements             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Face Shape: Measure forehead/cheek/jaw widths       │    │
│  │ Hair Type: Edge detection + color variance          │    │
│  │ Skin Tone: HSL lightness calculation                │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  MATCHING ENGINE                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ For each hairstyle in HAIRSTYLES[]:                 │    │
│  │   faceScore = compatibility[detectedFaceShape]      │    │
│  │   hairScore = compatibility[detectedHairType]       │    │
│  │   overallScore = (faceScore × 0.6) +                │    │
│  │                  (hairScore × 0.4)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  RANKING & FILTERING                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Filter by user preferences (maintenance, occasion)│   │
│  │ 2. Sort by overallScore (descending)                │    │
│  │ 3. Select top 3 haircuts + top 3 beards             │    │
│  │ 4. Create best combo (top haircut + top beard)      │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                OUTPUT: Recommendations Array                  │
│  [                                                            │
│    { name: "Quiff", overallScore: 92, type: "hair" },       │
│    { name: "Undercut", overallScore: 88, type: "hair" },    │
│    { name: "Buzz Cut", overallScore: 85, type: "hair" },    │
│    { name: "Stubble", overallScore: 95, type: "beard" },    │
│    { name: "Circle Beard", overallScore: 90, type: "beard" },│
│    { name: "Goatee", overallScore: 85, type: "beard" },     │
│    { name: "Quiff & Stubble", ..., type: "combo" }          │
│  ]                                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
Production Setup

┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite Build)                     │
│                  Hosted on: Vercel / Netlify                 │
│                   Static Files (HTML/JS/CSS)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express Server)                     │
│                  Hosted on: Heroku / Railway                 │
│                    Port: process.env.PORT                    │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               DATABASE (PostgreSQL)                          │
│            Hosted on: Supabase / Neon / RDS                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Workflow (Agile)

### Sprint Structure
- **Sprint Duration**: 2 weeks
- **Team Roles**: Full-stack developer (you), Product Owner (business requirements)
- **Ceremonies**: Sprint planning, daily standups, retrospective

### Sprint Breakdown

**Sprint 1: Foundation**
- ✅ Project setup (Vite + React + TypeScript)
- ✅ Database schema design
- ✅ Authentication system (JWT)
- ✅ Basic routing structure

**Sprint 2: Core Features**
- ✅ Service catalog page
- ✅ Booking flow implementation
- ✅ Barber profiles
- ✅ Customer dashboard

**Sprint 3: Staff Features**
- ✅ Barber dashboard (tabbed interface)
- ✅ Admin dashboard (tabbed interface)
- ✅ Service/Barber CRUD operations
- ✅ Booking management

**Sprint 4: AI Integration**
- ✅ Face detection algorithm
- ✅ Feature extraction (face shape, hair type, skin tone)
- ✅ Recommendation engine
- ✅ AI Try-On page UI

**Sprint 5: Polish & Production**
- ✅ Responsive design refinements
- ✅ Dark theme consistency
- ✅ Performance optimization
- ✅ Documentation

---

## Key Algorithms Explained

### 1. Skin Pixel Detection (RGB-based)
```javascript
function isSkinPixel(r, g, b) {
  return (
    r > 95 &&           // Red channel threshold
    g > 40 &&           // Green channel threshold
    b > 20 &&           // Blue channel threshold
    max(r,g,b) - min(r,g,b) > 15 &&  // Color variance
    abs(r - g) > 15 &&  // R-G difference
    r > g &&            // Red dominance
    r > b               // Red > Blue
  );
}
```
**Why it works**: Human skin has characteristic RGB ratios across all ethnicities. Red channel is dominant, with specific variance patterns.

### 2. Face Shape Classification (Geometric)
```javascript
if (faceWidth ≈ faceHeight && jawWidth > cheekWidth * 0.9) {
  return 'square';  // Compact with strong jaw
} else if (faceWidth ≈ faceHeight) {
  return 'round';   // Compact with soft jaw
} else if (cheekWidth > foreheadWidth && cheekWidth > jawWidth) {
  return jawWidth < foreheadWidth * 0.8 ? 'diamond' : 'oval';
} else if (foreheadWidth > jawWidth) {
  return 'heart';   // Wide forehead, narrow chin
}
```

### 3. Compatibility Scoring (Weighted Average)
```javascript
overallScore = (faceShapeScore * 0.6) + (hairTypeScore * 0.4)
```
**Rationale**: Face shape is more important (60%) than hair type (40%) for style suitability.

---

## Testing Strategy

### Unit Tests (Recommended)
- ✅ `aiService.analyzeFace()` - Test with various face types
- ✅ `AuthContext` - Login/logout flow
- ✅ Color detection algorithms

### Integration Tests
- ✅ API endpoints (POST /bookings, GET /bookings)
- ✅ Database queries

### E2E Tests (Cypress/Playwright)
- ✅ User signup → booking → confirmation flow
- ✅ Admin add service → customer books it

---

## Security Considerations

1. **Password Security**: bcrypt hashing (salt rounds: 10)
2. **JWT Expiration**: Tokens expire after 24h
3. **Input Validation**: All API inputs sanitized
4. **SQL Injection Prevention**: Parameterized queries
5. **XSS Protection**: React auto-escapes JSX
6. **CORS**: Configured for production domain only

---

## Performance Optimizations

1. **Image Processing**: Resize to 500px before analysis
2. **Lazy Loading**: React.lazy() for routes
3. **Memoization**: useMemo() for expensive calculations
4. **Database Indexing**: On user_id, stylist_id, date columns
5. **CDN**: Static assets served via Vercel/Netlify edge network

---

## Future Enhancements

1. **Real-time Availability**: WebSocket integration for live booking updates
2. **Payment Integration**: Stripe/PayPal for online payments
3. **SMS Notifications**: Twilio for appointment reminders
4. **Advanced AI**: TensorFlow.js for more accurate face detection
5. **Review System**: Customer ratings for barbers
6. **Loyalty Program**: Points and rewards system

---

## Glossary

- **SPA**: Single Page Application
- **JWT**: JSON Web Token (authentication)
- **CRUD**: Create, Read, Update, Delete
- **HSL**: Hue, Saturation, Lightness (color model)
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer (API design)

---

**Document Version**: 1.0  
**Last Updated**: November 25, 2024  
**Author**: Development Team  
**Status**: Production Ready
