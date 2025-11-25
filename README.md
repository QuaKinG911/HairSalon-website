# Luxe Barber

A premium men's grooming website featuring AI-powered hairstyle consultation and online booking system.

## Features

- **AI Face Analysis**: Upload photos for personalized hairstyle and beard recommendations based on face shape, hair type, and skin tone
- **Online Booking**: Schedule appointments with professional barbers
- **User Authentication**: Secure login system with role-based access (Customer, Barber, Admin)
- **Dashboard Management**: Separate dashboards for customers, barbers, and administrators
- **Service Catalog**: Browse available grooming services and packages
- **Stylist Profiles**: View barber profiles and specialties
- **Contact System**: Integrated messaging and contact forms
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + JWT Authentication
- **Database**: JSON file storage (easily replaceable with PostgreSQL/SQLite)
- **Styling**: Tailwind CSS with custom amber color palette
- **Icons**: Lucide React
- **Build Tools**: Vite, PostCSS, Autoprefixer

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/QuaKinG911/HairSalon-website.git
   cd hairsalon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development servers:
   ```bash
   npm run dev:full
   ```
   This will start both the frontend (port 3000) and backend (port 3001).

### Alternative Commands

- **Frontend only**: `npm run dev`
- **Backend only**: `npm run server`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Usage

### Demo Accounts

- **Admin**: admin@hairsalon.com / password
- **Barber**: barber@hairsalon.com / password
- **Customer**: customer@example.com / password

### Key Features

1. **AI Style Consultation**: Navigate to `/ai-try-on` to upload a photo and receive personalized hairstyle recommendations
2. **Booking System**: Register/login as a customer to book appointments
3. **Admin Panel**: Login as admin to manage services, barbers, and bookings
4. **Barber Dashboard**: Barbers can view their schedules and manage appointments

## Project Structure

```
├── components/          # Reusable React components
├── context/            # React Context providers (Auth, Booking)
├── pages/              # Page components organized by role
├── public/             # Static assets (images)
├── server/             # Express backend
│   ├── config/         # Database and email configuration
│   ├── middleware/     # Authentication middleware
│   ├── routes/         # API endpoints
│   └── utils/          # Server utilities
├── services/           # Client-side services (AI analysis)
├── src/                # Main source files
├── types.ts            # TypeScript type definitions
└── constants.ts        # Application constants
```

## API Endpoints

- `GET /api/services` - Get all services
- `POST /api/bookings` - Create booking
- `GET /api/barbers` - Get barber information
- `POST /api/auth/login` - User authentication
- `POST /api/contact` - Send contact message

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is for educational and demonstration purposes.