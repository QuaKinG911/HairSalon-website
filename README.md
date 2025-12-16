# Luxe Barber ✂️

> **Experience the Future of Grooming**

A premium, full-stack men's grooming platform that combines traditional barbering excellence with cutting-edge technology. Luxe Barber offers a seamless experience for customers to discover styles, book appointments, and manage their grooming journey.

## About the Project

Luxe Barber is a comprehensive barbershop management system designed to modernize the grooming experience. The platform features an intelligent booking system, AI-powered style consultation, and dedicated dashboards for customers, barbers, and administrators.

### Key Features

**AI-Powered Style Consultation**
- Smart Mirror technology that analyzes your unique features in real-time
- Face shape detection (Oval, Square, Round, Heart, or Diamond)
- Hair texture analysis (Straight, Wavy, Curly, or Coily)
- Skin tone matching for personalized style recommendations
- Privacy-first: All analysis happens locally in your browser

**Intelligent Booking System**
- Real-time availability viewing
- Instant appointment booking
- Role-based access control:
  - **Customers**: Book appointments, view history, save favorite styles
  - **Barbers**: Manage schedules, view appointments, set availability
  - **Admins**: Full oversight of users, services, and shop performance

**Comprehensive Dashboards**
- Admin Dashboard: Analytics, user management, service catalog control
- Barber Dashboard: Appointment tracking and portfolio management
- Customer Dashboard: Style recommendations, booking management, profile settings

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher (comes with Node.js)

You can verify your installations by running:
```bash
node --version
npm --version
```

## Getting Started

Follow these steps to set up and run the Luxe Barber application on your local machine.

### Step 1: Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/QuaKinG911/HairSalon-website.git
cd HairSalon-website
```

### Step 2: Install Dependencies

Install all required dependencies for both the frontend and backend:

```bash
npm install
```

This command will install all the necessary packages listed in `package.json`. The installation may take a few minutes.

### Step 3: Set Up Environment Variables (Optional)

Create a `.env` file in the root directory of the project. This file is optional for development, as the application will use default values if it's not present.

Create the file:
```bash
touch .env
```

Add the following content to `.env`:
```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-this-in-production
```

**Note**: For production deployments, make sure to use a strong, unique JWT_SECRET value.

### Step 4: Database Setup

The application uses SQLite as its database, which requires no additional setup. The database file (`hairsalon.db`) will be automatically created when you first run the server. If you have an existing `database.json` file, the application will automatically migrate that data to the SQLite database on first run.

### Step 5: Start the Application

Run both the frontend and backend servers simultaneously:

```bash
npm run dev:full
```

This command starts:
- **Backend Server**: Running on `http://localhost:3001`
- **Frontend Application**: Running on `http://localhost:5173` (or the port specified in your Vite configuration)

### Step 6: Access the Application

Once both servers are running, open your web browser and navigate to:

```
http://localhost:5173
```

You should see the Luxe Barber homepage. The application is now ready to use!

## Demo Accounts

To explore the different user roles, you can use these pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hairsalon.com` | `password` |
| **Barber** | `marcus@hairsalon.com` | `password` |
| **Customer** | `customer@example.com` | `password` |

## Available Scripts

The project includes several npm scripts for different purposes:

- `npm run dev` - Start only the frontend development server
- `npm run server` - Start only the backend server
- `npm run server:dev` - Start the backend server with auto-reload (nodemon)
- `npm run dev:full` - Start both frontend and backend concurrently (recommended)
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally

## Troubleshooting

**Port Already in Use**
If you encounter a "port already in use" error:
- Make sure no other applications are using ports 3001 (backend) or 5173 (frontend)
- You can change the ports in `vite.config.ts` (frontend) and `.env` file (backend)

**Database Issues**
- If you encounter database errors, delete the `hairsalon.db` file and restart the server
- The database will be recreated automatically with the proper schema

**Dependencies Installation Issues**
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you're using Node.js version 16 or higher

## Project Structure

```
├── components/          # Reusable UI components
├── context/            # Global state management (Auth, Booking)
├── pages/              # Route components (Dashboards, Home, etc.)
├── public/             # Static assets (images, etc.)
├── server/             # Backend Express application
│   ├── config/         # Configuration files (Database, Email)
│   ├── middleware/     # Authentication and error handling
│   ├── routes/         # API endpoints
│   └── server.js       # Backend entry point
├── services/           # AI and overlay logic
├── src/                # Frontend entry point and API client
├── utils/              # Shared utility functions
└── hairsalon.db        # SQLite database (auto-generated)
```

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## License

Distributed under the MIT License. See `LICENSE` for more information.
