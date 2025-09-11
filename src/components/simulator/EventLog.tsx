import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { SimulatorEvent } from '@/types/rabbitmq';
import { formatDistanceToNow } from 'date-fns';

interface EventLogProps {
  events: SimulatorEvent[];
}

const eventTypeColors = {
  exchange_created: 'bg-exchange-direct/20 text-exchange-direct',
  queue_created: 'bg-queue/20 text-queue',
  consumer_created: 'bg-consumer/20 text-consumer',
  binding_created: 'bg-accent/20 text-accent',
  message_published: 'bg-message/20 text-message',
  message_routed: 'bg-primary/20 text-primary',
  message_consumed: 'bg-green-500/20 text-green-400',
  message_rejected: 'bg-destructive/20 text-destructive',
  message_dlq: 'bg-dlq/20 text-dlq'
};

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <Card className="glass h-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Event Log</h3>
          <Badge variant="secondary" className="text-xs">
            {events.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-2 pb-4">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">No events yet</p>
                <p className="text-xs">Events will appear here as you interact with the simulator</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Badge 
                    className={`text-xs px-2 py-1 ${eventTypeColors[event.type] || 'bg-muted text-muted-foreground'}`}
                  >
                    {event.type.replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};