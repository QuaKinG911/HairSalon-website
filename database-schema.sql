-- Database schema for Luxe Barber

-- Create database
CREATE DATABASE IF NOT EXISTS hairsalon_db;
USE hairsalon_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'barber', 'customer') NOT NULL DEFAULT 'customer',
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('Haircuts', 'Beard & Shave', 'Grooming', 'Packages') NOT NULL,
    image VARCHAR(500),
    duration VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Barbers table
CREATE TABLE IF NOT EXISTS barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Barber',
    bio TEXT,
    image VARCHAR(500),
    specialties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    barber_id INTEGER REFERENCES barbers(id),
    barber_name VARCHAR(255),
    services TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    payment_method ENUM('online', 'salon') NOT NULL DEFAULT 'online',
    payment_status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT IGNORE INTO users (email, password, role, name, phone) VALUES
('admin@hairsalon.com', 'admin123', 'admin', 'Admin User', NULL),
('barber@hairsalon.com', 'barber123', 'barber', 'John Barber', '+1234567890'),
('customer@example.com', 'customer123', 'customer', 'Jane Customer', '+0987654321');

-- Insert default services
INSERT IGNORE INTO services (name, description, price, category, image, duration) VALUES
('The Executive Cut', 'Precision scissor cut tailored to your head shape, finished with a straight razor neck shave and style.', 45.00, 'Haircuts', '/images/services/TheExecutiveCut.jpg', '45 minutes'),
('Skin Mask', 'Rejuvenating facial treatment with deep cleansing mask, exfoliation, and moisturizing therapy.', 50.00, 'Grooming', '/images/services/FaceMask.jpg', '30 minutes'),
('Traditional Hot Towel Shave', 'A relaxing straight razor shave with hot towel treatment, essential oils, and post-shave balm.', 55.00, 'Beard & Shave', '/images/services/TraditionalHotTowelShave.jpg', '45 minutes'),
('Beard Sculpt & Trim', 'Expert shaping of the beard and mustache with razor lining and conditioning oil.', 35.00, 'Beard & Shave', '/images/services/BeardSculpt&Trim.jpg', '30 minutes'),
('The Gentleman\'s Package', 'Our signature haircut combined with a hot towel shave or beard sculpt. The ultimate grooming experience.', 90.00, 'Packages', '/images/services/TheGentlemanPackage.jpg', '90 minutes'),
('Scalp Treatment & Massage', 'Exfoliating scalp therapy to promote hair health, accompanied by a 15-minute head massage.', 40.00, 'Grooming', '/images/services/ScalpTreatment&Massageman.jpg', '45 minutes');

-- Insert default barbers
INSERT IGNORE INTO barbers (name, role, bio, image, specialties) VALUES
('Marcus Thorne', 'Master Barber', 'Marcus blends old-school barbering techniques with modern styling to create timeless looks for the modern gentleman.', '/images/barbers/marcus-thorne.jpg', '["Hot Towel Shaves", "Precision Shear Work", "Classic Pompadours"]'),
('James "Jax" Jackson', 'Fade Specialist', 'Known for the sharpest line-ups in the city, Jax specializes in modern urban cuts and intricate designs.', '/images/barbers/james-jax-jackson.jpg', '["Skin Fades", "Hair Tattoos", "Beard Shaping"]'),
('Leo Varas', 'Senior Stylist', 'Leo brings 10 years of international experience, specializing in longer men\'s hairstyles and texture management.', '/images/barbers/leo-varas.jpg', '["Long Hair Styling", "Texturizing", "Grey Blending"]');