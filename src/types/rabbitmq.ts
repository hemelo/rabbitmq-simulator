export interface Position {
  x: number;
  y: number;
}

export type ExchangeType = 'direct' | 'fanout' | 'topic';

export interface Exchange {
  id: string;
  name: string;
  type: ExchangeType;
  position: Position;
  bindings: Binding[];
}

export interface Queue {
  id: string;
  name: string;
  position: Position;
  messages: Message[];
  dlq?: string; // Dead Letter Queue ID
  consumers: Consumer[];
  maxLength?: number;
  messageTtlMs?: number;
}

export interface Consumer {
  id: string;
  name: string;
  queueId: string;
  position: Position;
  isActive: boolean;
  processedMessages: number;
}

export interface Binding {
  id: string;
  queueId: string;
  exchangeId: string;
  routingKey: string;
}

export interface Message {
  id: string;
  content: string;
  routingKey: string;
  timestamp: Date;
  exchangeId?: string;
  status: 'published' | 'routed' | 'consumed' | 'rejected' | 'dlq';
}

export interface SimulatorEvent {
  id: string;
  type: 'exchange_created' | 'queue_created' | 'consumer_created' | 'binding_created' | 
        'message_published' | 'message_routed' | 'message_consumed' | 'message_rejected' | 'message_dlq' |
        'exchange_deleted' | 'queue_deleted' | 'consumer_deleted';
  timestamp: Date;
  description: string;
  details?: Record<string, any>;
}

export interface MessageFlow {
  id: string;
  messageId: string;
  componentId: string;
  componentType: 'exchange' | 'queue' | 'consumer';
  startTime: number;
  duration: number;
}

export interface SimulatorState {
  exchanges: Exchange[];
  queues: Queue[];
  consumers: Consumer[];
  bindings: Binding[];
  messages: Message[];
  events: SimulatorEvent[];
  activeFlows: MessageFlow[];
}