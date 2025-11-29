import express from 'express';
import db from '../config/database.js';
import schedule from 'node-schedule';

const router = express.Router();

// Get all bookings (admin/barber only)
router.get('/', async (req, res) => {
  try {
    const bookings = db.getBookings().map(booking => {
      const customer = db.getUserById(booking.customer_id);
      const barber = booking.barber_id ? db.getBarberById(booking.barber_id) : null;

      return {
        ...booking,
        customer_name: customer?.name || booking.customer_name,
        customer_email: customer?.email || booking.customer_email,
        customer_phone: customer?.phone || booking.customer_phone,
        barber_name: barber?.name || booking.barber_name
      };
    });

    res.json(bookings);
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

    const bookings = db.getBookings();
    const barbers = db.getBarbers();
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Helper to check if time is within schedule
    const isWithinSchedule = (barber, timeStr) => {
      if (!barber.schedule) return true; // Assume available if no schedule
      if (!barber.schedule.days.includes(dayName)) return false;
      return timeStr >= barber.schedule.start && timeStr < barber.schedule.end;
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
    const bookings = db.getBookingsByCustomer(customerId).map(booking => {
      const barber = booking.barber_id ? db.getBarberById(booking.barber_id) : null;
      return {
        ...booking,
        barber_name: barber?.name || booking.barber_name
      };
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = db.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const customer = db.getUserById(booking.customer_id);
    const barber = booking.barber_id ? db.getBarberById(booking.barber_id) : null;

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

    const booking = db.createBooking({
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
    const barber = barberId ? db.getBarberById(barberId) : null;
    const barberUser = barberId ? db.getUserByEmail('barber@hairsalon.com') : null; // assuming barber user
    const barberUserId = barberUser?.id;

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Morning reminder at 7:00 on booking day
    const morningReminderDate = new Date(year, month - 1, day, 7, 0, 0);
    schedule.scheduleJob(`morning-${booking.id}`, morningReminderDate, async () => {
      try {
        const subject = 'Appointment Reminder - Today';
        const content = `Reminder: Your appointment is today at ${time} with ${barberName}. Services: ${services.join(', ')}`;

        // Message to customer
        db.createMessage({
          sender_id: 1, // admin id
          recipient_id: customerId,
          subject,
          content
        });

        // Message to barber if assigned
        if (barberUserId) {
          db.createMessage({
            sender_id: 1,
            recipient_id: barberUserId,
            subject,
            content: `Reminder: You have an appointment today at ${time} with ${customerName}. Services: ${services.join(', ')}`
          });
        }
      } catch (error) {
        console.error('Error creating morning reminder:', error);
      }
    });

    // 1 hour before reminder
    const appointmentDate = new Date(year, month - 1, day, hour, minute, 0);
    const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    schedule.scheduleJob(`onehour-${booking.id}`, oneHourBefore, async () => {
      try {
        const subject = 'Appointment Reminder - 1 Hour Away';
        const content = `Your appointment is in 1 hour at ${time} with ${barberName}. Services: ${services.join(', ')}`;

        // Message to customer
        db.createMessage({
          sender_id: 1,
          recipient_id: customerId,
          subject,
          content
        });

        // Message to barber
        if (barberUserId) {
          db.createMessage({
            sender_id: 1,
            recipient_id: barberUserId,
            subject,
            content: `Appointment in 1 hour at ${time} with ${customerName}. Services: ${services.join(', ')}`
          });
        }
      } catch (error) {
        console.error('Error creating 1-hour reminder:', error);
      }
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

    const booking = db.updateBookingStatus(id, status);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = db.deleteBooking(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;