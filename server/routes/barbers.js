import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await db.getBarbers();
    res.json(barbers);
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get barber by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const barber = await db.getBarberById(id);

    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Get barber error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new barber (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, role, bio, image, specialties } = req.body;

    const barber = await db.createBarber({
      name,
      role: role || 'Barber',
      bio,
      image,
      specialties: specialties // passed as array/object, handled in db adapter
    });

    res.status(201).json(barber);
  } catch (error) {
    console.error('Create barber error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update barber (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating barber ${id}...`);
    const { name, role, bio, image, specialties, schedule } = req.body;
    console.log('Update data:', { name, role, bio, image, specialties, schedule });

    const barber = await db.updateBarber(id, {
      name,
      role,
      bio,
      image,
      specialties: specialties, // passed as array/object
      schedule: schedule
    });

    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Update barber error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete barber (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const barber = await db.deleteBarber(id);

    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    res.json({ message: 'Barber deleted successfully' });
  } catch (error) {
    console.error('Delete barber error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;