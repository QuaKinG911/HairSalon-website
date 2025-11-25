import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = db.getBarbers();
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
    const barber = db.getBarberById(id);

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

    const barber = db.createBarber({
      name,
      role: role || 'Barber',
      bio,
      image,
      specialties: JSON.stringify(specialties)
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
    const { name, role, bio, image, specialties } = req.body;

    const barber = db.updateBarber(id, {
      name,
      role,
      bio,
      image,
      specialties: JSON.stringify(specialties)
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
    const barber = db.deleteBarber(id);

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