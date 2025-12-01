import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SqliteDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../../hairsalon.db');
    this.jsonDbPath = path.join(__dirname, '../../database.json');
    this.db = null;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      console.log('Connected to SQLite database');

      await this.createTables();
      await this.migrateDataIfNeeded();

      return this.db;
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async createTables() {
    // Users
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        name TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Saved Styles (Many-to-Many relationship for users and styles/images)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_saved_styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        style_data TEXT, -- JSON string of the style object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Services
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        duration TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Barbers
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS barbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Barber',
        bio TEXT,
        image TEXT,
        specialties TEXT, -- JSON string
        schedule TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_number TEXT UNIQUE,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        barber_id INTEGER,
        barber_name TEXT,
        services TEXT NOT NULL, -- JSON string
        date DATE NOT NULL,
        time TIME NOT NULL,
        payment_method TEXT DEFAULT 'online',
        payment_status TEXT DEFAULT 'pending',
        status TEXT DEFAULT 'pending',
        total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES users(id),
        FOREIGN KEY(barber_id) REFERENCES barbers(id)
      )
    `);

    // Contact Messages
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages (Internal messaging)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        recipient_id INTEGER,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(recipient_id) REFERENCES users(id)
      )
    `);
  }

  async migrateDataIfNeeded() {
    const userCount = await this.db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('Database already contains data, skipping migration');
      return;
    }

    if (fs.existsSync(this.jsonDbPath)) {
      console.log('Migrating data from database.json...');
      try {
        const data = JSON.parse(fs.readFileSync(this.jsonDbPath, 'utf8'));

        // Migrate Users
        if (data.users) {
          for (const user of data.users) {
            await this.db.run(
              `INSERT INTO users (id, email, password, role, name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [user.id, user.email, user.password, user.role, user.name, user.phone, user.created_at]
            );

            if (user.saved_styles && Array.isArray(user.saved_styles)) {
              for (const style of user.saved_styles) {
                await this.db.run(
                  `INSERT INTO user_saved_styles (user_id, style_data) VALUES (?, ?)`,
                  [user.id, JSON.stringify(style)]
                );
              }
            }
          }
        }

        // Migrate Services
        if (data.services) {
          for (const service of data.services) {
            await this.db.run(
              `INSERT INTO services (id, name, description, price, category, image, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [service.id, service.name, service.description, service.price, service.category, service.image, service.duration, service.created_at]
            );
          }
        }

        // Migrate Barbers
        if (data.barbers) {
          for (const barber of data.barbers) {
            await this.db.run(
              `INSERT INTO barbers (id, name, role, bio, image, specialties, schedule, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [barber.id, barber.name, barber.role, barber.bio, barber.image, barber.specialties, JSON.stringify(barber.schedule), barber.created_at]
            );
          }
        }

        // Migrate Bookings
        if (data.bookings) {
          for (const booking of data.bookings) {
            await this.db.run(
              `INSERT INTO bookings (id, booking_number, customer_id, customer_name, customer_email, customer_phone, barber_id, barber_name, services, date, time, payment_method, payment_status, status, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [booking.id, booking.booking_number || null, booking.customer_id, booking.customer_name, booking.customer_email, booking.customer_phone, booking.barber_id, booking.barber_name, JSON.stringify(booking.services), booking.date, booking.time, booking.payment_method, booking.payment_status, booking.status, booking.total, booking.created_at]
            );
          }
        }

        // Migrate Contact Messages
        if (data.contact_messages) {
          for (const msg of data.contact_messages) {
            await this.db.run(
              `INSERT INTO contact_messages (id, name, email, phone, subject, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [msg.id, msg.name, msg.email, msg.phone, msg.subject, msg.message, msg.read ? 1 : 0, msg.created_at]
            );
          }
        }

        // Migrate Messages
        if (data.messages) {
          for (const msg of data.messages) {
            await this.db.run(
              `INSERT INTO messages (id, sender_id, recipient_id, content, read, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
              [msg.id, msg.sender_id, msg.recipient_id, msg.content, msg.read ? 1 : 0, msg.created_at]
            );
          }
        }

        console.log('Migration completed successfully');
      } catch (error) {
        console.error('Migration failed:', error);
      }
    }
  }

  async ensureInitialized() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Users
  async getUsers() {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM users');
  }

  async getUserById(id) {
    const db = await this.ensureInitialized();
    const user = await db.get('SELECT * FROM users WHERE id = ?', id);
    if (user) {
      const savedStyles = await db.all('SELECT style_data FROM user_saved_styles WHERE user_id = ?', id);
      user.saved_styles = savedStyles.map(s => JSON.parse(s.style_data));
    }
    return user;
  }

  async getUserByEmail(email) {
    const db = await this.ensureInitialized();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (user) {
      const savedStyles = await db.all('SELECT style_data FROM user_saved_styles WHERE user_id = ?', user.id);
      user.saved_styles = savedStyles.map(s => JSON.parse(s.style_data));
    }
    return user;
  }

  async createUser(userData) {
    const db = await this.ensureInitialized();
    const { email, password, role, name, phone } = userData;
    const result = await db.run(
      'INSERT INTO users (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, password, role, name, phone]
    );
    return this.getUserById(result.lastID);
  }

  async addSavedStyle(userId, style) {
    const db = await this.ensureInitialized();
    const currentStyles = await db.all('SELECT style_data FROM user_saved_styles WHERE user_id = ?', userId);
    const exists = currentStyles.some(s => {
      const parsed = JSON.parse(s.style_data);
      return parsed.id === style.id;
    });

    if (!exists) {
      await db.run(
        'INSERT INTO user_saved_styles (user_id, style_data) VALUES (?, ?)',
        [userId, JSON.stringify(style)]
      );
    }

    return (await this.getUserById(userId)).saved_styles;
  }

  async removeSavedStyle(userId, styleId) {
    const db = await this.ensureInitialized();
    const rows = await db.all('SELECT id, style_data FROM user_saved_styles WHERE user_id = ?', userId);
    for (const row of rows) {
      const style = JSON.parse(row.style_data);
      if (style.id === parseInt(styleId) || style.id === styleId) {
        await db.run('DELETE FROM user_saved_styles WHERE id = ?', row.id);
      }
    }

    return (await this.getUserById(userId)).saved_styles;
  }

  // Services
  async getServices() {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM services');
  }

  async getServiceById(id) {
    const db = await this.ensureInitialized();
    return await db.get('SELECT * FROM services WHERE id = ?', id);
  }

  async createService(serviceData) {
    const db = await this.ensureInitialized();
    const { name, description, price, category, image, duration } = serviceData;
    const result = await db.run(
      'INSERT INTO services (name, description, price, category, image, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image, duration]
    );
    return this.getServiceById(result.lastID);
  }

  async updateService(id, serviceData) {
    const db = await this.ensureInitialized();
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(serviceData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);

    await db.run(
      `UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return this.getServiceById(id);
  }

  async deleteService(id) {
    const db = await this.ensureInitialized();
    const service = await this.getServiceById(id);
    if (service) {
      await db.run('DELETE FROM services WHERE id = ?', id);
    }
    return service;
  }

  // Barbers
  async getBarbers() {
    const db = await this.ensureInitialized();
    const barbers = await db.all('SELECT * FROM barbers');
    return barbers.map(b => ({
      ...b,
      specialties: b.specialties ? JSON.parse(b.specialties) : [],
      schedule: b.schedule ? JSON.parse(b.schedule) : null
    }));
  }

  async getBarberById(id) {
    const db = await this.ensureInitialized();
    const barber = await db.get('SELECT * FROM barbers WHERE id = ?', id);
    if (barber) {
      barber.specialties = barber.specialties ? JSON.parse(barber.specialties) : [];
      barber.schedule = barber.schedule ? JSON.parse(barber.schedule) : null;
    }
    return barber;
  }

  async createBarber(barberData) {
    const db = await this.ensureInitialized();
    const { name, role, bio, image, specialties, schedule } = barberData;
    const result = await db.run(
      'INSERT INTO barbers (name, role, bio, image, specialties, schedule) VALUES (?, ?, ?, ?, ?, ?)',
      [name, role, bio, image, JSON.stringify(specialties), JSON.stringify(schedule)]
    );
    return this.getBarberById(result.lastID);
  }

  async updateBarber(id, barberData) {
    const db = await this.ensureInitialized();
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(barberData)) {
      if (value === undefined) continue;

      if (key === 'specialties' || key === 'schedule') {
        fields.push(`${key} = ?`);
        // Ensure we don't double-stringify if it's already a string
        values.push(typeof value === 'string' ? value : JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.getBarberById(id);

    values.push(id);

    try {
      await db.run(
        `UPDATE barbers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return this.getBarberById(id);
    } catch (error) {
      console.error("Error updating barber:", error);
      throw error;
    }
  }

  async deleteBarber(id) {
    const db = await this.ensureInitialized();
    const barber = await this.getBarberById(id);
    if (barber) {
      await db.run('DELETE FROM barbers WHERE id = ?', id);
    }
    return barber;
  }

  // Bookings
  async getBookings() {
    const db = await this.ensureInitialized();
    const bookings = await db.all('SELECT * FROM bookings');
    return bookings.map(b => ({
      ...b,
      services: JSON.parse(b.services)
    }));
  }

  async getBookingById(id) {
    const db = await this.ensureInitialized();
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', id);
    if (booking) {
      booking.services = JSON.parse(booking.services);
    }
    return booking;
  }

  async getBookingsByCustomer(customerId) {
    const db = await this.ensureInitialized();
    const bookings = await db.all('SELECT * FROM bookings WHERE customer_id = ?', customerId);
    return bookings.map(b => ({
      ...b,
      services: JSON.parse(b.services)
    }));
  }

  async createBooking(bookingData) {
    const db = await this.ensureInitialized();
    const { booking_number, customer_id, customer_name, customer_email, customer_phone, barber_id, barber_name, services, date, time, payment_method, payment_status, status, total } = bookingData;

    const result = await db.run(
      `INSERT INTO bookings (booking_number, customer_id, customer_name, customer_email, customer_phone, barber_id, barber_name, services, date, time, payment_method, payment_status, status, total) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_number, customer_id, customer_name, customer_email, customer_phone, barber_id, barber_name, JSON.stringify(services), date, time, payment_method, payment_status, status, total]
    );
    return this.getBookingById(result.lastID);
  }

  async updateBookingStatus(id, status) {
    const db = await this.ensureInitialized();
    await db.run(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return this.getBookingById(id);
  }

  async deleteBooking(id) {
    const db = await this.ensureInitialized();
    const booking = await this.getBookingById(id);
    if (booking) {
      await db.run('DELETE FROM bookings WHERE id = ?', id);
    }
    return booking;
  }

  // Contact Messages
  async getContactMessages() {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM contact_messages');
  }

  async getContactMessageById(id) {
    const db = await this.ensureInitialized();
    return await db.get('SELECT * FROM contact_messages WHERE id = ?', id);
  }

  async createContactMessage(messageData) {
    const db = await this.ensureInitialized();
    const { name, email, phone, subject, message } = messageData;
    const result = await db.run(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, subject, message]
    );
    return this.getContactMessageById(result.lastID);
  }

  async markContactMessageAsRead(id) {
    const db = await this.ensureInitialized();
    await db.run('UPDATE contact_messages SET read = 1 WHERE id = ?', id);
    return this.getContactMessageById(id);
  }

  async deleteContactMessage(id) {
    const db = await this.ensureInitialized();
    const message = await this.getContactMessageById(id);
    if (message) {
      await db.run('DELETE FROM contact_messages WHERE id = ?', id);
    }
    return message;
  }

  // Messages (Internal)
  async getMessages() {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM messages');
  }

  async getMessageById(id) {
    const db = await this.ensureInitialized();
    return await db.get('SELECT * FROM messages WHERE id = ?', id);
  }

  async getMessagesBySender(senderId) {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM messages WHERE sender_id = ?', senderId);
  }

  async getMessagesByRecipient(recipientId) {
    const db = await this.ensureInitialized();
    return await db.all('SELECT * FROM messages WHERE recipient_id = ?', recipientId);
  }

  async getConversation(senderId, recipientId) {
    const db = await this.ensureInitialized();
    return await db.all(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND recipient_id = ?) 
       OR (sender_id = ? AND recipient_id = ?) 
       ORDER BY created_at ASC`,
      [senderId, recipientId, recipientId, senderId]
    );
  }

  async createMessage(messageData) {
    const db = await this.ensureInitialized();
    const { sender_id, recipient_id, content } = messageData;
    const result = await db.run(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
      [sender_id, recipient_id, content]
    );
    return this.getMessageById(result.lastID);
  }

  async markInternalMessageAsRead(id) {
    const db = await this.ensureInitialized();
    await db.run('UPDATE messages SET read = 1 WHERE id = ?', id);
    return this.getMessageById(id);
  }

  async deleteMessage(id) {
    const db = await this.ensureInitialized();
    const message = await this.getMessageById(id);
    if (message) {
      await db.run('DELETE FROM messages WHERE id = ?', id);
    }
    return message;
  }
}

const db = new SqliteDatabase();

export default db;