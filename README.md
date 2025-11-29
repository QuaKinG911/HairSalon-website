# Luxe Barber ✂️

> **Experience the Future of Grooming**

A premium, full-stack men's grooming platform that combines traditional barbering excellence with cutting-edge AI technology. Luxe Barber offers a seamless experience for customers to discover styles, book appointments, and manage their grooming journey.

![Luxe Barber Banner](https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop)

## ✨ Key Features

### 🤖 AI-Powered Style Consultation
Unlike generic filters, our **Smart Mirror** technology uses advanced client-side computer vision (Canvas API) to analyze your unique features in real-time:
- **Face Shape Detection**: Identifies if your face is Oval, Square, Round, Heart, or Diamond.
- **Hair Texture Analysis**: Detects Straight, Wavy, Curly, or Coily hair patterns.
- **Skin Tone Matching**: Recommends styles that complement your complexion.
- **Privacy First**: All analysis happens locally in your browser. No photos are ever uploaded to a server.

### 📅 Intelligent Booking System
- **Real-time Availability**: View barber schedules and book slots instantly.
- **Role-Based Access**:
    - **Customers**: Book appointments, view history, and save favorite styles.
    - **Barbers**: Manage personal schedules, view upcoming appointments, and set availability.
    - **Admins**: Full oversight of users, services, and shop performance.

### 💼 Comprehensive Dashboards
Dedicated portals for every user type ensure a tailored experience:
- **Admin Dashboard**: Analytics, user management, and service catalog control.
- **Barber Dashboard**: Appointment tracking and portfolio management.
- **Customer Dashboard**: Style recommendations, booking management, and profile settings.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer

### Database
- **System**: Custom JSON-based Local Database
- **Why?**: Zero-configuration, easy to deploy for demonstrations, and portable.
- **Structure**: `database.json` acts as the single source of truth, managed by `server/config/database.js`.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuaKinG911/HairSalon-website.git
   cd hairsalon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   This command runs both the React frontend and the Express backend concurrently.
   ```bash
   npm run dev:full
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3001`

## 🔐 Environment Variables

Create a `.env` file in the root directory (optional, defaults provided for development):

```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-this-in-production
```

## 📂 Project Structure

```
├── src/                  # Frontend React Application
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route components (Dashboards, Home, etc.)
│   ├── services/         # API clients & AI Logic
│   │   └── aiService.ts  # Client-side computer vision logic
│   └── context/          # Global state (Auth, Theme)
├── server/               # Backend Express Application
│   ├── config/           # Configuration
│   │   └── database.js   # Custom JSON database implementation
│   ├── routes/           # API Endpoints
│   ├── middleware/       # Auth & Error handling
│   └── server.js         # Entry point
├── database.json         # Local data storage
└── public/               # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `POST /api/auth/register` - Create a new customer account.

### Services
- `GET /api/services` - List all grooming services.
- `GET /api/services/:id` - Get details of a specific service.

### Bookings
- `GET /api/bookings` - Get user's bookings.
- `POST /api/bookings` - Create a new appointment.
- `PUT /api/bookings/:id/status` - Update booking status (Cancel/Confirm).

### AI Analysis
- *Note: The AI analysis is client-side. No API endpoint is required for face processing.*

## 👥 Demo Accounts

Use these credentials to explore the different roles:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hairsalon.com` | `password` |
| **Barber** | `marcus@hairsalon.com` | `password` |
| **Customer** | `customer@example.com` | `password` |

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.