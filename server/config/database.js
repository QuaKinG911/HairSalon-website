import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON-based database for development
class SimpleDatabase {
  constructor() {
    this.dataFile = path.join(__dirname, '../../database.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      console.log('Loading database from:', this.dataFile);
      if (fs.existsSync(this.dataFile)) {
        console.log('Database file exists, reading...');
        const data = fs.readFileSync(this.dataFile, 'utf8');
        return JSON.parse(data);
      } else {
        console.log('Database file does not exist, will create default data');
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }

    // Initialize with default data
    const defaultData = {
      users: [
        {
          id: 1,
          email: 'admin@hairsalon.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          role: 'admin',
          name: 'Admin User',
          phone: null,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'marcus@hairsalon.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          role: 'barber',
          name: 'Marcus Thorne',
          phone: '+1234567890',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          email: 'jax@hairsalon.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          role: 'barber',
          name: 'James "Jax" Jackson',
          phone: '+1234567891',
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          email: 'leo@hairsalon.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          role: 'barber',
          name: 'Leo Varas',
          phone: '+1234567892',
          created_at: new Date().toISOString()
        },
        {
          id: 5,
          email: 'customer@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          role: 'customer',
          name: 'Jane Customer',
          phone: '+0987654321',
          created_at: new Date().toISOString()
        }
      ],
      services: [
        {
          id: 1,
          name: 'The Executive Cut',
          description: 'Precision scissor cut tailored to your head shape, finished with a straight razor neck shave and style.',
          price: 45.00,
          category: 'Haircuts',
          image: '/images/services/TheExecutiveCut.jpg',
          duration: '45 minutes',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Skin Mask',
          description: 'Rejuvenating facial treatment with deep cleansing mask, exfoliation, and moisturizing therapy.',
          price: 50.00,
          category: 'Grooming',
          image: '/images/services/FaceMask.jpg',
          duration: '30 minutes',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Traditional Hot Towel Shave',
          description: 'A relaxing straight razor shave with hot towel treatment, essential oils, and post-shave balm.',
          price: 55.00,
          category: 'Beard & Shave',
          image: '/images/services/TraditionalHotTowelShave.jpg',
          duration: '45 minutes',
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Beard Sculpt & Trim',
          description: 'Expert shaping of the beard and mustache with razor lining and conditioning oil.',
          price: 35.00,
          category: 'Beard & Shave',
          image: '/images/services/BeardSculpt&Trim.jpg',
          duration: '30 minutes',
          created_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'The Gentleman\'s Package',
          description: 'Our signature haircut combined with a hot towel shave or beard sculpt. The ultimate grooming experience.',
          price: 90.00,
          category: 'Packages',
          image: '/images/services/TheGentlemanPackage.jpg',
          duration: '90 minutes',
          created_at: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Scalp Treatment & Massage',
          description: 'Exfoliating scalp therapy to promote hair health, accompanied by a 15-minute head massage.',
          price: 40.00,
          category: 'Grooming',
          image: '/images/services/ScalpTreatment&Massageman.jpg',
          duration: '45 minutes',
          created_at: new Date().toISOString()
        }
      ],
      barbers: [
        {
          id: 1,
          name: 'Marcus Thorne',
          role: 'Master Barber',
          bio: 'Marcus blends old-school barbering techniques with modern styling to create timeless looks for the modern gentleman.',
          image: '/images/barbers/marcus-thorne.jpg',
          specialties: '["Hot Towel Shaves", "Precision Shear Work", "Classic Pompadours"]',
          schedule: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            start: '09:00',
            end: '17:00'
          },
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'James "Jax" Jackson',
          role: 'Fade Specialist',
          bio: 'Known for the sharpest line-ups in the city, Jax specializes in modern urban cuts and intricate designs.',
          image: '/images/barbers/james-jax-jackson.jpg',
          specialties: '["Skin Fades", "Hair Tattoos", "Beard Shaping"]',
          schedule: {
            days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            start: '10:00',
            end: '18:00'
          },
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Leo Varas',
          role: 'Senior Stylist',
          bio: 'Leo brings 10 years of international experience, specializing in longer men\'s hairstyles and texture management.',
          image: '/images/barbers/leo-varas.jpg',
          specialties: '["Long Hair Styling", "Texturizing", "Grey Blending"]',
          schedule: {
            days: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            start: '09:00',
            end: '16:00'
          },
          created_at: new Date().toISOString()
        }
      ],
      bookings: [],
      contact_messages: [],
      messages: []
    };

    this.saveData(defaultData);
    return defaultData;
  }

  saveData(data = this.data) {
    try {
      console.log('Saving database to:', this.dataFile);
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      console.log('Database saved successfully');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Users
  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(user => user.id === parseInt(id));
  }

  getUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  createUser(userData) {
    const newUser = {
      id: Math.max(...this.data.users.map(u => u.id), 0) + 1,
      ...userData,
      saved_styles: [],
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  addSavedStyle(userId, style) {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.saved_styles) user.saved_styles = [];
      // Check if style already exists
      if (!user.saved_styles.find(s => s.id === style.id)) {
        user.saved_styles.push(style);
        this.saveData();
      }
      return user.saved_styles;
    }
    return null;
  }

  removeSavedStyle(userId, styleId) {
    const user = this.getUserById(userId);
    if (user && user.saved_styles) {
      user.saved_styles = user.saved_styles.filter(s => s.id !== styleId);
      this.saveData();
      return user.saved_styles;
    }
    return null;
  }

  // Services
  getServices() {
    return this.data.services;
  }

  getServiceById(id) {
    return this.data.services.find(service => service.id === parseInt(id));
  }

  createService(serviceData) {
    const newService = {
      id: Math.max(...this.data.services.map(s => s.id), 0) + 1,
      ...serviceData,
      created_at: new Date().toISOString()
    };
    this.data.services.push(newService);
    this.saveData();
    return newService;
  }

  updateService(id, serviceData) {
    const index = this.data.services.findIndex(service => service.id === parseInt(id));
    if (index !== -1) {
      this.data.services[index] = { ...this.data.services[index], ...serviceData, updated_at: new Date().toISOString() };
      this.saveData();
      return this.data.services[index];
    }
    return null;
  }

  deleteService(id) {
    const index = this.data.services.findIndex(service => service.id === parseInt(id));
    if (index !== -1) {
      const deleted = this.data.services.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // Barbers
  getBarbers() {
    return this.data.barbers;
  }

  getBarberById(id) {
    return this.data.barbers.find(barber => barber.id === parseInt(id));
  }

  createBarber(barberData) {
    const newBarber = {
      id: Math.max(...this.data.barbers.map(b => b.id), 0) + 1,
      ...barberData,
      created_at: new Date().toISOString()
    };
    this.data.barbers.push(newBarber);
    this.saveData();
    return newBarber;
  }

  updateBarber(id, barberData) {
    const index = this.data.barbers.findIndex(barber => barber.id === parseInt(id));
    if (index !== -1) {
      this.data.barbers[index] = { ...this.data.barbers[index], ...barberData, updated_at: new Date().toISOString() };
      this.saveData();
      return this.data.barbers[index];
    }
    return null;
  }

  deleteBarber(id) {
    const index = this.data.barbers.findIndex(barber => barber.id === parseInt(id));
    if (index !== -1) {
      const deleted = this.data.barbers.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // Bookings
  getBookings() {
    return this.data.bookings;
  }

  getBookingById(id) {
    return this.data.bookings.find(booking => booking.id === parseInt(id));
  }

  getBookingsByCustomer(customerId) {
    return this.data.bookings.filter(booking => booking.customer_id === parseInt(customerId));
  }

  createBooking(bookingData) {
    const newBooking = {
      id: Math.max(...this.data.bookings.map(b => b.id), 0) + 1,
      ...bookingData,
      created_at: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);
    this.saveData();
    return newBooking;
  }

  updateBookingStatus(id, status) {
    const index = this.data.bookings.findIndex(booking => booking.id === parseInt(id));
    if (index !== -1) {
      this.data.bookings[index].status = status;
      this.data.bookings[index].updated_at = new Date().toISOString();
      this.saveData();
      return this.data.bookings[index];
    }
    return null;
  }

  deleteBooking(id) {
    const index = this.data.bookings.findIndex(booking => booking.id === parseInt(id));
    if (index !== -1) {
      const deleted = this.data.bookings.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // Contact Messages
  getContactMessages() {
    return this.data.contact_messages;
  }

  getContactMessageById(id) {
    return this.data.contact_messages.find(message => message.id === parseInt(id));
  }

  createContactMessage(messageData) {
    const newMessage = {
      id: Math.max(...this.data.contact_messages.map(m => m.id), 0) + 1,
      ...messageData,
      read: false,
      created_at: new Date().toISOString()
    };
    this.data.contact_messages.push(newMessage);
    this.saveData();
    return newMessage;
  }

  markMessageAsRead(id) {
    const index = this.data.contact_messages.findIndex(message => message.id === parseInt(id));
    if (index !== -1) {
      this.data.contact_messages[index].read = true;
      this.saveData();
      return this.data.contact_messages[index];
    }
    return null;
  }

  deleteContactMessage(id) {
    const index = this.data.contact_messages.findIndex(message => message.id === parseInt(id));
    if (index !== -1) {
      const deleted = this.data.contact_messages.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // Messages
  getMessages() {
    return this.data.messages;
  }

  getMessageById(id) {
    return this.data.messages.find(message => message.id === parseInt(id));
  }

  getMessagesBySender(senderId) {
    return this.data.messages.filter(message => message.sender_id === parseInt(senderId));
  }

  getMessagesByRecipient(recipientId) {
    return this.data.messages.filter(message => message.recipient_id === parseInt(recipientId));
  }

  getConversation(senderId, recipientId) {
    return this.data.messages.filter(message =>
      (message.sender_id === parseInt(senderId) && message.recipient_id === parseInt(recipientId)) ||
      (message.sender_id === parseInt(recipientId) && message.recipient_id === parseInt(senderId))
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  createMessage(messageData) {
    const newMessage = {
      id: Math.max(...this.data.messages.map(m => m.id), 0) + 1,
      ...messageData,
      read: false,
      created_at: new Date().toISOString()
    };
    this.data.messages.push(newMessage);
    this.saveData();
    return newMessage;
  }

  markMessageAsRead(id) {
    const index = this.data.messages.findIndex(message => message.id === parseInt(id));
    if (index !== -1) {
      this.data.messages[index].read = true;
      this.saveData();
      return this.data.messages[index];
    }
    return null;
  }

  deleteMessage(id) {
    const index = this.data.messages.findIndex(message => message.id === parseInt(id));
    if (index !== -1) {
      const deleted = this.data.messages.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }
}

const db = new SimpleDatabase();

export default db;