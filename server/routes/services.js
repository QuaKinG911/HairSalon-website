import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await db.getServices();
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.getServiceById(id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new service (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, image, duration } = req.body;

    const service = await db.createService({
      name,
      description,
      price,
      category,
      image,
      duration
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, duration } = req.body;

    const service = await db.updateService(id, {
      name,
      description,
      price,
      category,
      image,
      duration
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.deleteService(id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;