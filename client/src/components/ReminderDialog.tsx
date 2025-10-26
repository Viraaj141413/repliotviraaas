import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Loader2 } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Reminder } from '@shared/schema';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  reminderTime: z.string().min(1, 'Date and time are required'),
  notificationMethod: z.enum(['sms', 'call', 'whatsapp']),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  category: z.enum(['personal', 'work', 'health', 'other']).optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderFormData) => void;
  reminder?: Reminder | null;
  loading?: boolean;
}

export function ReminderDialog({ open, onClose, onSubmit, reminder, loading }: ReminderDialogProps) {
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? {
          title: reminder.title,
          description: reminder.description || '',
          reminderTime: new Date(reminder.reminderTime).toISOString().slice(0, 16),
          notificationMethod: reminder.notificationMethod as 'sms' | 'call' | 'whatsapp',
          recurrence: reminder.recurrence as 'none' | 'daily' | 'weekly' | 'monthly',
          category: reminder.category as 'personal' | 'work' | 'health' | 'other' | undefined,
        }
      : {
          title: '',
          description: '',
          reminderTime: '',
          notificationMethod: 'sms',
          recurrence: 'none',
          category: 'personal',
        },
  });

  const handleSubmit = (data: ReminderFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {reminder ? 'Edit Reminder' : 'Create New Reminder'}
          </DialogTitle>
          <DialogDescription>
            {reminder ? 'Update your reminder details' : 'Set up a new reminder with your preferred notification method'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What do you want to be reminded about?"
                      {...field}
                      data-testid="input-title"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      data-testid="input-datetime"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Method</FormLabel>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'sms', label: 'SMS', icon: MessageSquare },
                      { value: 'call', label: 'Voice Call', icon: Phone },
                      { value: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => field.onChange(method.value)}
                          className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                            field.value === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                          data-testid={`button-method-${method.value}`}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">{method.label}</p>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-recurrence" className="h-12">
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category" className="h-12">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} data-testid="button-save">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  reminder ? 'Update Reminder' : 'Create Reminder'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
