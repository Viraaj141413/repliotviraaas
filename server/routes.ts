import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertReminderSchema } from "@shared/schema";
import { sendSMS, makeVoiceCall, sendWhatsApp } from "./twilio";

// Middleware to get user from Supabase token
async function getUserFromToken(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  // In production, verify the Supabase JWT token
  // For now, extract user ID from the Authorization header
  // The frontend will send the Supabase user ID
  const userId = req.headers['x-user-id'];
  return userId || null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User profile endpoints
  app.get('/api/user/profile', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.patch('/api/user/profile', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateSchema = z.object({
        fullName: z.string().optional(),
        phoneNumber: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updated = await storage.updateUser(userId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(updated);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Reminder endpoints
  app.get('/api/reminders', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const reminders = await storage.getRemindersByUserId(userId);
      res.json(reminders);
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  app.post('/api/reminders', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const reminderData = insertReminderSchema.parse({
        ...req.body,
        userId,
      });

      const reminder = await storage.createReminder(reminderData);
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  });

  app.patch('/api/reminders/:id', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const reminder = await storage.getReminder(id);

      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      if (reminder.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updateSchema = insertReminderSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updated = await storage.updateReminder(id, validatedData);
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update reminder' });
    }
  });

  app.delete('/api/reminders/:id', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const reminder = await storage.getReminder(id);

      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      if (reminder.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await storage.deleteReminder(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  // Notification history endpoint
  app.get('/api/notifications/history', async (req, res) => {
    try {
      const userId = await getUserFromToken(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const history = await storage.getNotificationHistory(userId);
      res.json(history);
    } catch (error: any) {
      console.error('Error fetching notification history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Sync user from Supabase (called when user logs in)
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const { userId, email, fullName } = req.body;

      if (!userId || !email) {
        return res.status(400).json({ error: 'User ID and email required' });
      }

      let user = await storage.getUser(userId);
      
      if (!user) {
        user = await storage.createUser({
          email,
          fullName: fullName || null,
          phoneNumber: null,
        });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Background job to check and send notifications
  setInterval(async () => {
    try {
      const dueReminders = await storage.getDueReminders();
      
      for (const reminder of dueReminders) {
        const user = await storage.getUser(reminder.userId);
        if (!user || !user.phoneNumber) {
          console.log(`Skipping reminder ${reminder.id}: User has no phone number`);
          continue;
        }

        const message = `Reminder: ${reminder.title}${reminder.description ? ` - ${reminder.description}` : ''}`;
        let result;

        switch (reminder.notificationMethod) {
          case 'sms':
            result = await sendSMS(user.phoneNumber, message);
            break;
          case 'call':
            result = await makeVoiceCall(user.phoneNumber, message);
            break;
          case 'whatsapp':
            result = await sendWhatsApp(user.phoneNumber, message);
            break;
          default:
            console.error('Unknown notification method:', reminder.notificationMethod);
            continue;
        }

        await storage.createNotificationHistory({
          reminderId: reminder.id,
          userId: reminder.userId,
          method: reminder.notificationMethod,
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.success ? null : result.error,
        });

        if (result.success) {
          console.log(`Sent ${reminder.notificationMethod} notification for reminder: ${reminder.title}`);
          
          // If it's a non-recurring reminder, mark as completed
          if (reminder.recurrence === 'none') {
            await storage.updateReminder(reminder.id, { isCompleted: true });
          } else {
            // Handle recurring reminders
            const currentTime = new Date(reminder.reminderTime);
            let nextTime = new Date(currentTime);
            
            switch (reminder.recurrence) {
              case 'daily':
                nextTime.setDate(nextTime.getDate() + 1);
                break;
              case 'weekly':
                nextTime.setDate(nextTime.getDate() + 7);
                break;
              case 'monthly':
                nextTime.setMonth(nextTime.getMonth() + 1);
                break;
            }
            
            await storage.updateReminder(reminder.id, { reminderTime: nextTime });
          }
        }
      }
    } catch (error) {
      console.error('Error in notification job:', error);
    }
  }, 60000); // Check every minute

  const httpServer = createServer(app);
  return httpServer;
}
