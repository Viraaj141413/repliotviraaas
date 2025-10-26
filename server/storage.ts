import { 
  type User, 
  type InsertUser, 
  type Reminder, 
  type InsertReminder,
  type NotificationHistory,
  type InsertNotificationHistory 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Reminder methods
  getReminder(id: string): Promise<Reminder | undefined>;
  getRemindersByUserId(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, updates: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  
  // Notification history methods
  getNotificationHistory(userId: string): Promise<NotificationHistory[]>;
  createNotificationHistory(history: InsertNotificationHistory): Promise<NotificationHistory>;
  
  // Scheduled reminders (for cron job)
  getDueReminders(): Promise<Reminder[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reminders: Map<string, Reminder>;
  private notificationHistory: Map<string, NotificationHistory>;
  private processedReminders: Set<string>; // Track which reminders have been sent

  constructor() {
    this.users = new Map();
    this.reminders = new Map();
    this.notificationHistory = new Map();
    this.processedReminders = new Set();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Reminder methods
  async getReminder(id: string): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async getRemindersByUserId(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const now = new Date();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updated = {
      ...reminder,
      ...updates,
      updatedAt: new Date()
    };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Notification history methods
  async getNotificationHistory(userId: string): Promise<NotificationHistory[]> {
    return Array.from(this.notificationHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async createNotificationHistory(insertHistory: InsertNotificationHistory): Promise<NotificationHistory> {
    const id = randomUUID();
    const history: NotificationHistory = {
      ...insertHistory,
      id,
      sentAt: new Date(),
    };
    this.notificationHistory.set(id, history);
    return history;
  }

  // Scheduled reminders
  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.reminders.values())
      .filter(reminder => {
        if (reminder.isCompleted) return false;
        
        const reminderTime = new Date(reminder.reminderTime);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Send if reminder time is in the past or within next 5 minutes
        const isDue = timeDiff <= 5 * 60 * 1000 && timeDiff > -60 * 60 * 1000;
        
        // Create unique key for this reminder + time window (to prevent duplicate sends)
        const key = `${reminder.id}-${Math.floor(reminderTime.getTime() / (5 * 60 * 1000))}`;
        
        if (isDue && !this.processedReminders.has(key)) {
          this.processedReminders.add(key);
          return true;
        }
        
        return false;
      });
  }
}

export const storage = new MemStorage();
