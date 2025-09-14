import { v4 as uuidv4 } from 'uuid';
import type {
  Binding,
  Consumer,
  Exchange,
  ExchangeType,
  Message,
  MessageFlow,
  Position,
  Queue,
  SimulatorEvent,
  SimulatorState
} from '@/types/rabbitmq';

export interface EngineConfig {
  autoConsumeIntervalMs?: number;
  rejectProbability?: number; // 0..1
}

type Subscriber = (state: SimulatorState) => void;

export class Engine {
  private state: SimulatorState;
  private subscribers: Set<Subscriber> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private config: Required<EngineConfig>;
  private currentDemo: string | null = null;

  constructor(config?: EngineConfig) {
    this.config = {
      autoConsumeIntervalMs: config?.autoConsumeIntervalMs ?? 1000,
      rejectProbability: config?.rejectProbability ?? 0.1
    };

    this.state = {
      exchanges: [],
      queues: [],
      consumers: [],
      bindings: [],
      messages: [],
      events: [],
      activeFlows: []
    };
  }

  subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
    cb(this.getState());
    return () => this.subscribers.delete(cb);
  }

  getState(): SimulatorState {
    // Return a shallow-cloned state to avoid external mutation
    return {
      ...this.state,
      exchanges: [...this.state.exchanges],
      queues: [...this.state.queues],
      consumers: [...this.state.consumers],
      bindings: [...this.state.bindings],
      messages: [...this.state.messages],
      events: [...this.state.events]
    };
  }


  resume() {
    console.log('Resume called, timer state:', this.timer, 'currentDemo:', this.currentDemo);
    if (this.timer === null) {
      this.timer = setInterval(() => this.tick(), this.config.autoConsumeIntervalMs);
      console.log('Timer started');
    } else {
      console.log('Timer already running');
    }
    
    // Always publish demo messages if a demo is loaded (regardless of timer state)
    if (this.currentDemo) {
      console.log('Publishing demo messages for:', this.currentDemo);
      this.publishDemoMessages();
    }
  }

  step() {
    this.tick();
  }

  setCurrentDemo(demoType: string | null) {
    this.currentDemo = demoType;
  }

  private publishDemoMessages() {
    if (!this.currentDemo) {
      console.log('No current demo set, not publishing messages');
      return;
    }
    
    console.log(`Publishing messages for demo: ${this.currentDemo}`);
    switch (this.currentDemo) {
      case 'ecommerce':
        this.publishEcommerceMessages();
        break;
      case 'microservices':
        this.publishMicroservicesMessages();
        break;
      case 'fanout':
        this.publishFanoutMessages();
        break;
      case 'dlq':
        this.publishDLQMessages();
        break;
      case 'scaling':
        this.publishScalingMessages();
        break;
    }
  }

  private tick() {
    console.log('Tick called, checking for messages to consume...');
    // Handle TTL expiration
    const now = Date.now();
    let ttlEvents: SimulatorEvent[] = [];
    let queues = this.state.queues.map(q => {
      if (!q.messageTtlMs || q.messages.length === 0) return q;
      const [expired, alive]: [Message[], Message[]] = q.messages.reduce<[Message[], Message[]]>((acc, m) => {
        if (now - new Date(m.timestamp).getTime() >= q.messageTtlMs!) acc[0].push(m); else acc[1].push(m);
        return acc;
      }, [[], []]);

      if (expired.length === 0) return q;

      if (q.dlq) {
        const dlq = this.state.queues.find(x => x.id === q.dlq);
        if (dlq) {
          dlq.messages = [...dlq.messages, ...expired.map(m => ({ ...m, status: 'dlq' as const }))];
          ttlEvents.push(...expired.map(m => this.buildEvent('message_dlq', `Message expired and moved to DLQ`, { messageId: m.id, queueId: q.id })));
        }
      }

      ttlEvents.push(...expired.map(m => this.buildEvent('message_rejected', `Message expired (TTL)`, { messageId: m.id, queueId: q.id })));
      return { ...q, messages: alive };
    });

    if (ttlEvents.length > 0) {
      this.state = { ...this.state, queues };
      this.pushEvents(ttlEvents);
      this.emit();
    }

    // Auto-consume one message per tick
    this.consumeOnce();
  }

  private emit() {
    const snapshot = this.getState();
    this.subscribers.forEach(s => s(snapshot));
  }

  private pushEvents(events: SimulatorEvent[] | SimulatorEvent) {
    const list = Array.isArray(events) ? events : [events];
    const merged = [...list, ...this.state.events].slice(0, 100);
    this.state = { ...this.state, events: merged };
  }

  private buildEvent(type: SimulatorEvent['type'], description: string, details?: Record<string, any>): SimulatorEvent {
    return { id: uuidv4(), type, timestamp: new Date(), description, details };
  }

  private createFlow(messageId: string, componentId: string, componentType: 'exchange' | 'queue' | 'consumer', duration: number = 1000): MessageFlow {
    return {
      id: uuidv4(),
      messageId,
      componentId,
      componentType,
      startTime: Date.now(),
      duration
    };
  }

  private addFlow(flow: MessageFlow) {
    this.state = { ...this.state, activeFlows: [...this.state.activeFlows, flow] };
    this.emit();
    
    // Remove flow after duration
    setTimeout(() => {
      this.state = { 
        ...this.state, 
        activeFlows: this.state.activeFlows.filter(f => f.id !== flow.id) 
      };
      this.emit();
    }, flow.duration);
  }

  createExchange(name: string, type: ExchangeType, position: Position): Exchange {
    const exchange: Exchange = { id: uuidv4(), name, type, position, bindings: [] };
    this.state = { ...this.state, exchanges: [...this.state.exchanges, exchange] };
    this.pushEvents(this.buildEvent('exchange_created', `Exchange "${name}" (${type}) created`, { exchangeId: exchange.id }));
    this.emit();
    return exchange;
  }

  createQueue(name: string, position: Position, dlq?: string, maxLength?: number, messageTtlMs?: number): Queue {
    const queue: Queue = { id: uuidv4(), name, position, messages: [], consumers: [], dlq, maxLength, messageTtlMs } as Queue;
    this.state = { ...this.state, queues: [...this.state.queues, queue] };
    this.pushEvents(this.buildEvent('queue_created', `Queue "${name}" created`, { queueId: queue.id }));
    this.emit();
    return queue;
  }

  createConsumer(name: string, queueId: string, position: Position): Consumer {
    const consumer: Consumer = { id: uuidv4(), name, queueId, position, isActive: true, processedMessages: 0 };
    const queues = this.state.queues.map(q => q.id === queueId ? { ...q, consumers: [...q.consumers, consumer] } : q);
    this.state = { ...this.state, consumers: [...this.state.consumers, consumer], queues };
    this.pushEvents(this.buildEvent('consumer_created', `Consumer "${name}" created for queue`, { consumerId: consumer.id, queueId }));
    this.emit();
    return consumer;
  }

  createBinding(exchangeId: string, queueId: string, routingKey: string): Binding {
    const binding: Binding = { id: uuidv4(), exchangeId, queueId, routingKey };
    const exchanges = this.state.exchanges.map(e => e.id === exchangeId ? { ...e, bindings: [...e.bindings, binding] } : e);
    this.state = { ...this.state, bindings: [...this.state.bindings, binding], exchanges };
    this.pushEvents(this.buildEvent('binding_created', `Binding created: ${routingKey}`, { bindingId: binding.id, exchangeId, queueId }));
    this.emit();
    return binding;
  }

  moveExchange(exchangeId: string, position: Position) {
    this.state = {
      ...this.state,
      exchanges: this.state.exchanges.map(e => e.id === exchangeId ? { ...e, position } : e)
    };
    this.emit();
  }

  moveQueue(queueId: string, position: Position) {
    this.state = {
      ...this.state,
      queues: this.state.queues.map(q => q.id === queueId ? { ...q, position } : q)
    };
    this.emit();
  }

  moveConsumer(consumerId: string, position: Position) {
    this.state = {
      ...this.state,
      consumers: this.state.consumers.map(c => c.id === consumerId ? { ...c, position } : c)
    };
    this.emit();
  }

  publishMessage(exchangeId: string, content: string, routingKey: string): Message {
    const exchange = this.state.exchanges.find(e => e.id === exchangeId);
    if (!exchange) throw new Error('Exchange not found');

    const message: Message = { id: uuidv4(), content, routingKey, timestamp: new Date(), exchangeId, status: 'published' };

    // Add flow for exchange
    const exchangeFlow = this.createFlow(message.id, exchangeId, 'exchange', 800);
    this.addFlow(exchangeFlow);

    // Route message
    const routedQueueIds = this.routeQueues(exchange.type, exchangeId, routingKey);

    let queues = this.state.queues;
    for (const qId of routedQueueIds) {
      const queue = queues.find(q => q.id === qId);
      if (!queue) continue;

      // Add flow for queue
      const queueFlow = this.createFlow(message.id, qId, 'queue', 1000);
      this.addFlow(queueFlow);

      const willExceed = queue.maxLength !== undefined && queue.messages.length + 1 > queue.maxLength;
      if (willExceed && queue.dlq) {
        const dlq = queues.find(x => x.id === queue.dlq);
        if (dlq) {
          dlq.messages = [...dlq.messages, { ...message, status: 'dlq' }];
          this.pushEvents(this.buildEvent('message_dlq', `Queue at max length; message routed to DLQ`, { messageId: message.id, queueId: queue.id }));
        }
      } else if (!willExceed) {
        queue.messages = [...queue.messages, { ...message, status: 'routed' }];
        this.pushEvents(this.buildEvent('message_routed', `Message routed to queue`, { 
          messageId: message.id, 
          queueId: queue.id, 
          messageContent: message.content 
        }));
      } // else dropped silently
    }

    this.state = { ...this.state, messages: [...this.state.messages, message], queues: queues.map(q => ({ ...q })) };
    this.pushEvents(this.buildEvent('message_published', `Message published with routing key "${routingKey}"`, { 
      messageId: message.id, 
      exchangeId, 
      routingKey, 
      messageContent: message.content 
    }));
    this.emit();
    return message;
  }

  consumeOnce() {
    const q = this.state.queues.find(x => x.messages.length > 0 && x.consumers.some(c => c.isActive));
    if (!q) {
      console.log('No queue with messages and active consumers found');
      return;
    }
    console.log(`Found queue with ${q.messages.length} messages, consuming...`);
    const message = q.messages[0];
    
    // Get all active consumers for this queue
    const activeConsumers = q.consumers.filter(c => c.isActive);
    if (activeConsumers.length === 0) return;
    
    // Load balancing: round-robin selection based on consumer processing count
    // Find the consumer with the least processed messages for fair distribution
    const consumer = activeConsumers.reduce((least, current) => 
      current.processedMessages < least.processedMessages ? current : least
    );

    // Add flow for consumer
    const consumerFlow = this.createFlow(message.id, consumer.id, 'consumer', 600);
    this.addFlow(consumerFlow);

    const isRejected = Math.random() < this.config.rejectProbability;

    if (isRejected && q.dlq) {
      // Move to DLQ
      const dlq = this.state.queues.find(x => x.id === q.dlq);
      if (dlq) {
        dlq.messages = [...dlq.messages, { ...message, status: 'dlq' }];
        // Add flow for DLQ
        const dlqFlow = this.createFlow(message.id, dlq.id, 'queue', 800);
        this.addFlow(dlqFlow);
      }
      q.messages = q.messages.slice(1);
      this.pushEvents([
        this.buildEvent('message_dlq', `Message moved to Dead Letter Queue`, { messageId: message.id, queueId: q.id }),
        this.buildEvent('message_rejected', `Message rejected by ${consumer.name}`, { messageId: message.id, consumerId: consumer.id })
      ]);
    } else {
      // Normal consumption (or rejected without DLQ to mirror prior behavior)
      q.messages = q.messages.slice(1);
      const consumers = this.state.consumers.map(c => c.id === consumer.id ? { ...c, processedMessages: c.processedMessages + 1 } : c);
      this.state = { ...this.state, consumers };
      this.pushEvents(this.buildEvent(isRejected ? 'message_rejected' : 'message_consumed', `Message ${isRejected ? 'rejected' : 'consumed'} by ${consumer.name}`, { 
        messageId: message.id, 
        consumerId: consumer.id, 
        messageContent: message.content 
      }));
    }

    this.emit();
  }

  private routeQueues(type: ExchangeType, exchangeId: string, routingKey: string): string[] {
    if (type === 'direct') {
      return this.state.bindings.filter(b => b.exchangeId === exchangeId && b.routingKey === routingKey).map(b => b.queueId);
    }
    if (type === 'fanout') {
      return this.state.bindings.filter(b => b.exchangeId === exchangeId).map(b => b.queueId);
    }
    // topic
    return this.state.bindings.filter(b => b.exchangeId === exchangeId && matchesTopicPattern(b.routingKey, routingKey)).map(b => b.queueId);
  }

  serialize(): SimulatorState {
    return this.getState();
  }

  load(state: SimulatorState) {
    this.state = {
      ...state,
      // Ensure arrays are copied
      exchanges: [...state.exchanges],
      queues: [...state.queues],
      consumers: [...state.consumers],
      bindings: [...state.bindings],
      messages: [...state.messages],
      events: [...state.events]
    };
    this.emit();
  }

  deleteExchange(exchangeId: string) {
    this.state = {
      ...this.state,
      exchanges: this.state.exchanges.filter(e => e.id !== exchangeId),
      bindings: this.state.bindings.filter(b => b.exchangeId !== exchangeId)
    };
    this.pushEvents(this.buildEvent('exchange_deleted', `Exchange deleted`, { exchangeId }));
    this.emit();
  }

  deleteQueue(queueId: string) {
    this.state = {
      ...this.state,
      queues: this.state.queues.filter(q => q.id !== queueId),
      consumers: this.state.consumers.filter(c => c.queueId !== queueId),
      bindings: this.state.bindings.filter(b => b.queueId !== queueId)
    };
    this.pushEvents(this.buildEvent('queue_deleted', `Queue deleted`, { queueId }));
    this.emit();
  }

  deleteConsumer(consumerId: string) {
    this.state = {
      ...this.state,
      consumers: this.state.consumers.filter(c => c.id !== consumerId)
    };
    this.pushEvents(this.buildEvent('consumer_deleted', `Consumer deleted`, { consumerId }));
    this.emit();
  }

  // Rename methods
  renameExchange(exchangeId: string, newName: string) {
    const exchange = this.state.exchanges.find(e => e.id === exchangeId);
    if (!exchange) return;

    // Check if name already exists
    const existingExchange = this.state.exchanges.find(e => e.name === newName && e.id !== exchangeId);
    if (existingExchange) {
      this.pushEvents(this.buildEvent('error', `Exchange name "${newName}" already exists`, { exchangeId, newName }));
      this.emit();
      return;
    }

    this.state = {
      ...this.state,
      exchanges: this.state.exchanges.map(e => 
        e.id === exchangeId ? { ...e, name: newName } : e
      )
    };
    this.pushEvents(this.buildEvent('exchange_renamed', `Exchange renamed to "${newName}"`, { exchangeId, oldName: exchange.name, newName }));
    this.emit();
  }

  renameQueue(queueId: string, newName: string) {
    const queue = this.state.queues.find(q => q.id === queueId);
    if (!queue) return;

    // Check if name already exists
    const existingQueue = this.state.queues.find(q => q.name === newName && q.id !== queueId);
    if (existingQueue) {
      this.pushEvents(this.buildEvent('error', `Queue name "${newName}" already exists`, { queueId, newName }));
      this.emit();
      return;
    }

    this.state = {
      ...this.state,
      queues: this.state.queues.map(q => 
        q.id === queueId ? { ...q, name: newName } : q
      )
    };
    this.pushEvents(this.buildEvent('queue_renamed', `Queue renamed to "${newName}"`, { queueId, oldName: queue.name, newName }));
    this.emit();
  }

  renameConsumer(consumerId: string, newName: string) {
    const consumer = this.state.consumers.find(c => c.id === consumerId);
    if (!consumer) return;

    // Check if name already exists
    const existingConsumer = this.state.consumers.find(c => c.name === newName && c.id !== consumerId);
    if (existingConsumer) {
      this.pushEvents(this.buildEvent('error', `Consumer name "${newName}" already exists`, { consumerId, newName }));
      this.emit();
      return;
    }

    this.state = {
      ...this.state,
      consumers: this.state.consumers.map(c => 
        c.id === consumerId ? { ...c, name: newName } : c
      )
    };
    this.pushEvents(this.buildEvent('consumer_renamed', `Consumer renamed to "${newName}"`, { consumerId, oldName: consumer.name, newName }));
    this.emit();
  }

  // Demo message publishing methods
  private publishEcommerceMessages() {
    const exchange = this.state.exchanges.find(e => e.name === 'order-exchange');
    if (!exchange) {
      console.log('E-commerce exchange not found');
      return;
    }
    console.log('Publishing e-commerce messages...');
    setTimeout(() => {
      this.publishMessage(exchange.id, 'New order #1234', 'order.created');
      setTimeout(() => this.publishMessage(exchange.id, 'Order #1234 updated', 'order.updated'), 2000);
    }, 1000);
  }

  private publishMicroservicesMessages() {
    const userExchange = this.state.exchanges.find(e => e.name === 'user-service');
    const orderExchange = this.state.exchanges.find(e => e.name === 'order-service');
    const paymentExchange = this.state.exchanges.find(e => e.name === 'payment-service');
    
    if (!userExchange || !orderExchange || !paymentExchange) return;

    setTimeout(() => {
      this.publishMessage(userExchange.id, 'User John created', 'user.created');
      setTimeout(() => this.publishMessage(orderExchange.id, 'Order #5678 created', 'order.created'), 1500);
      setTimeout(() => this.publishMessage(paymentExchange.id, 'Payment $99.99 processed', 'payment.processed'), 3000);
    }, 1000);
  }

  private publishFanoutMessages() {
    const exchange = this.state.exchanges.find(e => e.name === 'news-broadcast');
    if (!exchange) return;

    setTimeout(() => {
      this.publishMessage(exchange.id, 'Breaking: New product launch!', '');
      setTimeout(() => this.publishMessage(exchange.id, 'System maintenance scheduled', ''), 2000);
    }, 1000);
  }

  private publishDLQMessages() {
    const exchange = this.state.exchanges.find(e => e.name === 'task-exchange');
    if (!exchange) return;

    setTimeout(() => {
      this.publishMessage(exchange.id, 'Task 1: Process order', 'task.process');
      setTimeout(() => this.publishMessage(exchange.id, 'Task 2: Send email', 'task.process'), 1000);
      setTimeout(() => this.publishMessage(exchange.id, 'Task 3: Generate report', 'task.process'), 2000);
      setTimeout(() => this.publishMessage(exchange.id, 'Task 4: Backup data', 'task.process'), 3000);
    }, 1000);
  }

  private publishScalingMessages() {
    const exchange = this.state.exchanges.find(e => e.name === 'work-exchange');
    if (!exchange) return;

    setTimeout(() => {
      this.publishMessage(exchange.id, 'Job 1: Process image', 'work.job');
      setTimeout(() => this.publishMessage(exchange.id, 'Job 2: Send notification', 'work.job'), 800);
      setTimeout(() => this.publishMessage(exchange.id, 'Job 3: Update database', 'work.job'), 1600);
      setTimeout(() => this.publishMessage(exchange.id, 'Job 4: Generate PDF', 'work.job'), 2400);
      setTimeout(() => this.publishMessage(exchange.id, 'Job 5: Send email', 'work.job'), 3200);
      setTimeout(() => this.publishMessage(exchange.id, 'Job 6: Backup data', 'work.job'), 4000);
      setTimeout(() => this.publishMessage(exchange.id, 'Job 7: Send SMS', 'work.job'), 4800);
    }, 1000);
  }
}

// Robust AMQP topic matching: '*' matches exactly one word; '#' matches zero or more words
export function matchesTopicPattern(pattern: string, routingKey: string): boolean {
  const patternParts = pattern.split('.');
  const keyParts = routingKey.split('.');

  let p = 0;
  let k = 0;

  while (p < patternParts.length && k < keyParts.length) {
    const pp = patternParts[p];
    const kp = keyParts[k];

    if (pp === '#') {
      // '#' at end matches rest
      if (p === patternParts.length - 1) return true;
      // Otherwise, consume until next literal/asterisk matches
      const next = patternParts[p + 1];
      // Try to find a position where subsequent part matches
      while (k < keyParts.length) {
        if (next === '#' || next === '*' || next === keyParts[k]) {
          const remainingPattern = patternParts.slice(p + 1).join('.');
          const remainingKey = keyParts.slice(k).join('.');
          return matchesTopicPattern(remainingPattern, remainingKey);
        }
        k++;
      }
      return false;
    }

    if (pp === '*' || pp === kp) {
      p++;
      k++;
      continue;
    }

    return false;
  }

  // Consume trailing '#' in pattern
  while (p < patternParts.length && patternParts[p] === '#') p++;

  return p === patternParts.length && k === keyParts.length;
}
