import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const messages = await db.getContactMessages();
    res.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contact message by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await db.getContactMessageById(id);

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newMessage = await db.createContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await db.markContactMessageAsRead(id);

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await db.deleteContactMessage(id);

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;