import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all messages (admin only)
router.get('/', async (req, res) => {
  try {
    const messages = db.getMessages();
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for current user
router.get('/my-messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('Getting my messages for user ID:', userId);
    if (!userId) {
      console.log('No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sentMessages = db.getMessagesBySender(userId);
    const receivedMessages = db.getMessagesByRecipient(userId);
    console.log('Sent messages:', sentMessages.length, 'Received messages:', receivedMessages.length);
    const allMessages = [...sentMessages, ...receivedMessages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allMessages);
  } catch (error) {
    console.error('Get my messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = db.getConversation(userId, otherUserId);
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = db.createMessage({
      sender_id: senderId,
      recipient_id: recipientId,
      subject,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = db.getMessageById(id);
    if (!message || message.recipient_id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedMessage = db.markMessageAsRead(id);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = db.getMessageById(id);
    if (!message || (message.sender_id !== parseInt(userId) && message.recipient_id !== parseInt(userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const deletedMessage = db.deleteMessage(id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;