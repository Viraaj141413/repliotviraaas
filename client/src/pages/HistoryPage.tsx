import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { NotificationHistory } from '@shared/schema';
import { format } from 'date-fns';

const methodIcons = {
  sms: MessageSquare,
  call: Phone,
  whatsapp: SiWhatsapp,
};

const statusConfig = {
  sent: { label: 'Sent', icon: CheckCircle, color: 'text-chart-1 bg-chart-1/10 border-chart-1/20' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-destructive bg-destructive/10 border-destructive/20' },
};

export default function HistoryPage() {
  const { data: history = [], isLoading } = useQuery<NotificationHistory[]>({
    queryKey: ['/api/notifications/history'],
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Notification History</h1>
        <p className="text-muted-foreground mt-2">
          Track all your notification deliveries
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading history...</p>
          </div>
        </div>
      ) : history.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No notification history</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              When your reminders trigger notifications, they'll appear here with delivery status.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const MethodIcon = methodIcons[item.method as keyof typeof methodIcons];
            const statusInfo = statusConfig[item.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={item.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MethodIcon className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {item.method}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(item.sentAt), 'PPpp')}
                    </p>

                    {item.errorMessage && (
                      <p className="text-sm text-destructive mt-2">
                        Error: {item.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
