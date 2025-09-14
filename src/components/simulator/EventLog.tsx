import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { SimulatorEvent } from '@/types/rabbitmq';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Link, 
  Send, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  Clock,
  Hash,
  Tag,
  Info
} from 'lucide-react';

interface EventLogProps {
  events: SimulatorEvent[];
}

const eventTypeConfig = {
  // Component Creation Events - Blue tones
  exchange_created: { 
    color: 'bg-blue-500 text-white border-blue-500', 
    icon: Plus, 
    label: 'Exchange Created' 
  },
  queue_created: { 
    color: 'bg-blue-600 text-white border-blue-600', 
    icon: Plus, 
    label: 'Queue Created' 
  },
  consumer_created: { 
    color: 'bg-blue-700 text-white border-blue-700', 
    icon: Plus, 
    label: 'Consumer Created' 
  },
  binding_created: { 
    color: 'bg-indigo-500 text-white border-indigo-500', 
    icon: Link, 
    label: 'Binding Created' 
  },
  
  // Component Deletion Events - Red tones
  exchange_deleted: { 
    color: 'bg-red-500 text-white border-red-500', 
    icon: Minus, 
    label: 'Exchange Deleted' 
  },
  queue_deleted: { 
    color: 'bg-red-600 text-white border-red-600', 
    icon: Minus, 
    label: 'Queue Deleted' 
  },
  consumer_deleted: { 
    color: 'bg-red-700 text-white border-red-700', 
    icon: Minus, 
    label: 'Consumer Deleted' 
  },
  
  // Message Flow Events - Green tones
  message_published: { 
    color: 'bg-emerald-500 text-white border-emerald-500', 
    icon: Send, 
    label: 'Message Published' 
  },
  message_routed: { 
    color: 'bg-green-500 text-white border-green-500', 
    icon: ArrowRight, 
    label: 'Message Routed' 
  },
  message_consumed: { 
    color: 'bg-green-600 text-white border-green-600', 
    icon: CheckCircle, 
    label: 'Message Consumed' 
  },
  
  // Error/Rejection Events - Orange/Red tones
  message_rejected: { 
    color: 'bg-orange-500 text-white border-orange-500', 
    icon: XCircle, 
    label: 'Message Rejected' 
  },
  message_dlq: { 
    color: 'bg-red-600 text-white border-red-600', 
    icon: AlertTriangle, 
    label: 'Message to DLQ' 
  }
};

const EVENTS_PER_PAGE = 20;

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Sort events by timestamp (most recent first) and paginate
  const { paginatedEvents, totalPages, totalEvents } = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const totalEvents = sortedEvents.length;
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);

    return { paginatedEvents, totalPages, totalEvents };
  }, [events, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Reset to first page when events change (new events added)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Event Log</h3>
          <Badge variant="secondary" className="text-xs">
            {totalEvents} events
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Real-time simulation events</p>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {paginatedEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="font-medium">No events yet</p>
                <p className="text-sm mt-1 opacity-75">Events will appear here as you interact with the simulator</p>
              </div>
            ) : (
              paginatedEvents.map((event) => {
                const isExpanded = expandedEvents.has(event.id);
                return (
                  <Collapsible key={event.id} open={isExpanded} onOpenChange={() => toggleEventExpansion(event.id)}>
                    <div className="rounded-lg border bg-card/50 hover:bg-card transition-colors">
                      <CollapsibleTrigger asChild>
                        <div className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Badge 
                              className={`text-xs font-semibold border-0 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 ${eventTypeConfig[event.type]?.color || 'bg-slate-500 text-white border-slate-500'}`}
                            >
                              {(() => {
                                const config = eventTypeConfig[event.type];
                                if (config?.icon) {
                                  const IconComponent = config.icon;
                                  return <IconComponent className="w-3 h-3" />;
                                }
                                return null;
                              })()}
                              {eventTypeConfig[event.type]?.label || event.type.replace(/_/g, ' ')}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground leading-relaxed">{event.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Hash className="w-3 h-3" />
                                  {event.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 border-t bg-muted/20">
                          <div className="pt-3 space-y-3">
                            {/* Event Details */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Event Details
                              </h4>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Type:</span>
                                  <code className="bg-muted px-1 rounded text-xs">{event.type}</code>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Timestamp:</span>
                                  <span className="text-xs">{format(event.timestamp, 'PPpp')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Hash className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Event ID:</span>
                                  <code className="bg-muted px-1 rounded text-xs font-mono">{event.id}</code>
                                </div>
                              </div>
                            </div>

                            {/* Additional Details */}
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Additional Details</h4>
                                <div className="space-y-1">
                                  {Object.entries(event.details).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                      <code className="bg-muted px-1 rounded text-xs font-mono">
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Message Content (if available) */}
                            {event.details?.messageId && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Message Content</h4>
                                <div className="bg-muted/50 rounded p-2 text-sm">
                                  <div className="font-mono text-xs break-all">
                                    {event.details.messageContent || 'Message content not available'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};