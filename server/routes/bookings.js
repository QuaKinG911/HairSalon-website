import express from 'express';
import db from '../config/database.js';
import schedule from 'node-schedule';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings (admin/barber only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await db.getBookings();

    // Filter based on role
    let filteredBookings = bookings;

    if (req.user.role === 'barber') {
      // Find the barber profile associated with this user
      // Assuming name matches for now as there's no direct link in schema
      const barbers = await db.getBarbers();
      const myBarberProfile = barbers.find(b => b.name === req.user.name);

      if (myBarberProfile) {
        filteredBookings = filteredBookings.filter(b => b.barber_id === myBarberProfile.id);
      } else {
        // If no profile found, maybe show none or all? 
        // Safer to show none if we are strict about "only the barber he choosed"
        filteredBookings = [];
      }
    } else if (req.user.role !== 'admin') {
      // If not admin and not barber (e.g. customer accessing this route?), return empty or error
      // Customers should use /customer/:id
      return res.status(403).json({ error: 'Access denied' });
    }

    const bookingsWithDetails = await Promise.all(filteredBookings.map(async (booking) => {
      const customer = await db.getUserById(booking.customer_id);
      const barber = booking.barber_id ? await db.getBarberById(booking.barber_id) : null;

      return {
        ...booking,
        customer_name: customer?.name || booking.customer_name,
        customer_email: customer?.email || booking.customer_email,
        customer_phone: customer?.phone || booking.customer_phone,
        barber_name: barber?.name || booking.barber_name
      };
    }));

    res.json(bookingsWithDetails);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check availability
router.get('/check-availability', async (req, res) => {
  try {
    const { date, time, barberId } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    const bookings = await db.getBookings();
    const barbers = await db.getBarbers();
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Helper to check if time is within schedule
    const isWithinSchedule = (barber, timeStr) => {
      if (!barber.schedule) return true; // Assume available if no schedule

      // Check for detailed slots first
      if (barber.schedule.slots && Array.isArray(barber.schedule.slots)) {
        const slot = barber.schedule.slots.find(s => s.day === dayName);
        if (!slot || !slot.isActive) return false;
        return timeStr >= slot.startTime && timeStr < slot.endTime;
      }

      // Fallback to old format
      if (barber.schedule.days && Array.isArray(barber.schedule.days)) {
        if (!barber.schedule.days.includes(dayName)) return false;
        return timeStr >= barber.schedule.start && timeStr < barber.schedule.end;
      }

      return false;
    };

    // Helper to check if barber is booked
    const isBooked = (barberId, dateStr, timeStr) => {
      return bookings.some(b =>
        b.barber_id === parseInt(barberId) &&
        b.date === dateStr &&
        b.time === timeStr &&
        b.status !== 'cancelled'
      );
    };

    const availableBarbers = barbers.filter(barber => {
      return isWithinSchedule(barber, time) && !isBooked(barber.id, date, time);
    });

    let response = {
      availableBarbers: availableBarbers.map(b => ({ id: b.id, name: b.name })),
      requestedBarberStatus: 'unknown',
      message: ''
    };

    if (barberId) {
      const barber = barbers.find(b => b.id === parseInt(barberId));
      if (!barber) {
        response.requestedBarberStatus = 'unknown';
        response.message = 'Barber not found';
      } else if (!isWithinSchedule(barber, time)) {
        response.requestedBarberStatus = 'off_schedule';
        response.message = `Sorry, ${barber.name} is not working at that time.`;
      } else if (isBooked(barberId, date, time)) {
        response.requestedBarberStatus = 'booked';
        response.message = `Sorry, ${barber.name} is already booked at that time.`;
      } else {
        response.requestedBarberStatus = 'available';
        response.message = `${barber.name} is available.`;
      }
    } else {
      if (availableBarbers.length === 0) {
        response.message = 'Sorry, none of the barbers are available at that time. Please check the schedule.';
      } else {
        response.message = 'Barbers are available.';
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bookings by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await db.getBookingsByCustomer(customerId);
    const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
      const barber = booking.barber_id ? await db.getBarberById(booking.barber_id) : null;
      return {
        ...booking,
        barber_name: barber?.name || booking.barber_name
      };
    }));

    res.json(bookingsWithDetails);
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const customer = await db.getUserById(booking.customer_id);
    const barber = booking.barber_id ? await db.getBarberById(booking.barber_id) : null;

    const bookingWithDetails = {
      ...booking,
      customer_name: customer?.name || booking.customer_name,
      customer_email: customer?.email || booking.customer_email,
      customer_phone: customer?.phone || booking.customer_phone,
      barber_name: barber?.name || booking.barber_name
    };

    res.json(bookingWithDetails);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      bookingNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      barberId,
      barberName,
      services,
      date,
      time,
      paymentMethod,
      paymentStatus,
      total
    } = req.body;

    const booking = await db.createBooking({
      booking_number: bookingNumber,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      barber_id: barberId,
      barber_name: barberName,
      services,
      date,
      time,
      payment_method: paymentMethod || 'online',
      payment_status: paymentStatus || 'pending',
      status: 'pending',
      total
    });

    // Schedule notifications
    const barber = barberId ? await db.getBarberById(barberId) : null;
    // Try to find barber user by name since we don't have direct link
    const users = await db.getUsers();
    const barberUser = barber ? users.find(u => u.name === barber.name && u.role === 'barber') : null;
    const barberUserId = barberUser?.id;

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Morning reminder at 7:00 on booking day
    const morningReminderDate = new Date(year, month - 1, day, 7, 0, 0);
    // Only schedule if it's in the future
    if (morningReminderDate > new Date()) {
      schedule.scheduleJob(`morning-${booking.id}`, morningReminderDate, async () => {
        try {
          const content = `Reminder: Your appointment is today at ${time} with ${barberName}. Services: ${services.join(', ')}`;

          // Message to customer
          await db.createMessage({
            sender_id: 1, // admin id
            recipient_id: customerId,
            content
          });

          // Message to barber if assigned
          if (barberUserId) {
            await db.createMessage({
              sender_id: 1,
              recipient_id: barberUserId,
              content: `Reminder: You have an appointment today at ${time} with ${customerName}. Services: ${services.join(', ')}`
            });
          }
        } catch (error) {
          console.error('Error creating morning reminder:', error);
        }
      });
    }

    // 1 hour before reminder
    const appointmentDate = new Date(year, month - 1, day, hour, minute, 0);
    const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    // Only schedule if it's in the future
    if (oneHourBefore > new Date()) {
      schedule.scheduleJob(`onehour-${booking.id}`, oneHourBefore, async () => {
        try {
          const content = `Your appointment is in 1 hour at ${time} with ${barberName}. Services: ${services.join(', ')}`;

          // Message to customer
          await db.createMessage({
            sender_id: 1,
            recipient_id: customerId,
            content
          });

          // Message to barber
          if (barberUserId) {
            await db.createMessage({
              sender_id: 1,
              recipient_id: barberUserId,
              content: `Appointment in 1 hour at ${time} with ${customerName}. Services: ${services.join(', ')}`
            });
          }
        } catch (error) {
          console.error('Error creating 1-hour reminder:', error);
        }
      });
    }

    // Immediate confirmation notification
    await db.createMessage({
      sender_id: 1, // admin
      recipient_id: customerId,
      content: `Booking Confirmed! Your appointment is set for ${date} at ${time} with ${barberName}.`
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (admin/barber only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await db.updateBookingStatus(id, status);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking (admin or owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const booking = await db.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Allow if admin or if the booking belongs to the user
    if (req.user.role !== 'admin' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Cancel scheduled jobs
    const morningJob = schedule.scheduledJobs[`morning-${id}`];
    if (morningJob) morningJob.cancel();

    const oneHourJob = schedule.scheduledJobs[`onehour-${id}`];
    if (oneHourJob) oneHourJob.cancel();

    await db.deleteBooking(id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;