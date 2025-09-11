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
  exchange_created: 'bg-exchange-direct text-exchange-direct border-exchange-direct',
  queue_created: 'bg-queue text-queue border-queue', 
  consumer_created: 'bg-consumer text-consumer border-consumer',
  binding_created: 'bg-accent text-accent border-accent',
  message_published: 'bg-message text-message border-message',
  message_routed: 'bg-primary text-primary border-primary',
  message_consumed: 'bg-green-500 text-green-100 border-green-500',
  message_rejected: 'bg-destructive text-destructive-foreground border-destructive',
  message_dlq: 'bg-dlq text-white border-dlq'
};

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Event Log</h3>
          <Badge variant="secondary">
            {events.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-4">
          <div className="space-y-3 pb-4">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="font-medium">No events yet</p>
                <p className="text-sm mt-1 opacity-75">Events will appear here as you interact with the simulator</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-start gap-3">
                    <Badge 
                      className={`text-xs font-medium border px-2 py-1 ${eventTypeColors[event.type] || 'bg-muted text-muted-foreground border-muted'}`}
                    >
                      {event.type.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground leading-relaxed">{event.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </p>
                    </div>
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