import { Reminder } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Calendar, Edit, Trash2, Check } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { format } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

const categoryColors = {
  personal: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  work: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  health: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  other: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

const notificationIcons = {
  sms: MessageSquare,
  call: Phone,
  whatsapp: SiWhatsapp,
};

const recurrenceLabels = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function ReminderCard({ reminder, onEdit, onDelete, onToggleComplete }: ReminderCardProps) {
  const NotificationIcon = notificationIcons[reminder.notificationMethod as keyof typeof notificationIcons];
  const isPast = new Date(reminder.reminderTime) < new Date();

  return (
    <Card className={`p-6 hover-elevate transition-all ${reminder.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {reminder.category && (
              <Badge
                variant="outline"
                className={`${categoryColors[reminder.category as keyof typeof categoryColors] || categoryColors.other} text-xs`}
                data-testid={`badge-category-${reminder.id}`}
              >
                {reminder.category}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="text-xs"
              data-testid={`badge-recurrence-${reminder.id}`}
            >
              {recurrenceLabels[reminder.recurrence as keyof typeof recurrenceLabels]}
            </Badge>
          </div>

          <h3 className={`text-lg font-semibold mb-1 ${reminder.isCompleted ? 'line-through' : ''}`} data-testid={`text-title-${reminder.id}`}>
            {reminder.title}
          </h3>

          {reminder.description && (
            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${reminder.id}`}>
              {reminder.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span data-testid={`text-datetime-${reminder.id}`}>
                {format(new Date(reminder.reminderTime), 'MMM d, yyyy · h:mm a')}
              </span>
              {isPast && !reminder.isCompleted && (
                <Badge variant="destructive" className="text-xs ml-2">
                  Overdue
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <NotificationIcon className="h-4 w-4" />
              <span className="capitalize">{reminder.notificationMethod}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleComplete(reminder.id, !reminder.isCompleted)}
            data-testid={`button-complete-${reminder.id}`}
            className={reminder.isCompleted ? 'bg-primary/10 text-primary' : ''}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(reminder)}
            data-testid={`button-edit-${reminder.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(reminder.id)}
            data-testid={`button-delete-${reminder.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
