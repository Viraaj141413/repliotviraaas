import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReminderCard } from '@/components/ReminderCard';
import { ReminderDialog } from '@/components/ReminderDialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Reminder } from '@shared/schema';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export default function DashboardPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/reminders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({ title: 'Success', description: 'Reminder created successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create reminder', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/api/reminders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({ title: 'Success', description: 'Reminder updated successfully' });
      setDialogOpen(false);
      setEditingReminder(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update reminder', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/reminders/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({ title: 'Success', description: 'Reminder deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete reminder', variant: 'destructive' });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      apiRequest('PATCH', `/api/reminders/${id}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    toggleCompleteMutation.mutate({ id, isCompleted });
  };

  const todayReminders = reminders.filter(r => !r.isCompleted && isToday(new Date(r.reminderTime)));
  const upcomingReminders = reminders.filter(r => !r.isCompleted && !isPast(new Date(r.reminderTime)) && !isToday(new Date(r.reminderTime)));
  const completedReminders = reminders.filter(r => r.isCompleted);
  const overdueReminders = reminders.filter(r => !r.isCompleted && isPast(new Date(r.reminderTime)));

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setEditingReminder(null);
            setDialogOpen(true);
          }}
          data-testid="button-new-reminder"
          className="h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Reminder
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-today">{todayReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              reminders scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-upcoming">{upcomingReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              future reminders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-completed">{completedReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              tasks finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-overdue">{overdueReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading reminders...</p>
          </div>
        </div>
      ) : reminders.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No reminders yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first reminder. Choose from SMS, voice calls, or WhatsApp notifications.
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Reminder
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {overdueReminders.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-destructive">Overdue</h2>
              <div className="grid gap-4">
                {overdueReminders.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {todayReminders.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Today</h2>
              <div className="grid gap-4">
                {todayReminders.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {upcomingReminders.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingReminders.slice(0, 6).map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ReminderDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={handleSubmit}
        reminder={editingReminder}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Button
        size="lg"
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        onClick={() => {
          setEditingReminder(null);
          setDialogOpen(true);
        }}
        data-testid="fab-new-reminder"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
