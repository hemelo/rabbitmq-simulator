import { useState, useCallback } from 'react';
import { 
  Exchange, 
  Queue, 
  Consumer, 
  Binding, 
  Message, 
  SimulatorState, 
  SimulatorEvent,
  ExchangeType,
  Position 
} from '@/types/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

export const useSimulator = () => {
  const [state, setState] = useState<SimulatorState>({
    exchanges: [],
    queues: [],
    consumers: [],
    bindings: [],
    messages: [],
    events: []
  });

  const addEvent = useCallback((type: SimulatorEvent['type'], description: string, details?: Record<string, any>) => {
    const event: SimulatorEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date(),
      description,
      details
    };
    
    setState(prev => ({
      ...prev,
      events: [event, ...prev.events].slice(0, 100) // Keep last 100 events
    }));
  }, []);

  const createExchange = useCallback((name: string, type: ExchangeType, position: Position) => {
    const exchange: Exchange = {
      id: uuidv4(),
      name,
      type,
      position,
      bindings: []
    };

    setState(prev => ({
      ...prev,
      exchanges: [...prev.exchanges, exchange]
    }));

    addEvent('exchange_created', `Exchange "${name}" (${type}) created`, { exchangeId: exchange.id });
    return exchange;
  }, [addEvent]);

  const createQueue = useCallback((name: string, position: Position, dlq?: string) => {
    const queue: Queue = {
      id: uuidv4(),
      name,
      position,
      messages: [],
      consumers: [],
      dlq
    };

    setState(prev => ({
      ...prev,
      queues: [...prev.queues, queue]
    }));

    addEvent('queue_created', `Queue "${name}" created`, { queueId: queue.id });
    return queue;
  }, [addEvent]);

  const createConsumer = useCallback((name: string, queueId: string, position: Position) => {
    const consumer: Consumer = {
      id: uuidv4(),
      name,
      queueId,
      position,
      isActive: true,
      processedMessages: 0
    };

    setState(prev => ({
      ...prev,
      consumers: [...prev.consumers, consumer],
      queues: prev.queues.map(q => 
        q.id === queueId 
          ? { ...q, consumers: [...q.consumers, consumer] }
          : q
      )
    }));

    addEvent('consumer_created', `Consumer "${name}" created for queue`, { consumerId: consumer.id, queueId });
    return consumer;
  }, [addEvent]);

  const createBinding = useCallback((exchangeId: string, queueId: string, routingKey: string) => {
    const binding: Binding = {
      id: uuidv4(),
      exchangeId,
      queueId,
      routingKey
    };

    setState(prev => ({
      ...prev,
      bindings: [...prev.bindings, binding],
      exchanges: prev.exchanges.map(e => 
        e.id === exchangeId 
          ? { ...e, bindings: [...e.bindings, binding] }
          : e
      )
    }));

    addEvent('binding_created', `Binding created: ${routingKey}`, { bindingId: binding.id, exchangeId, queueId });
    return binding;
  }, [addEvent]);

  const publishMessage = useCallback((exchangeId: string, content: string, routingKey: string) => {
    const message: Message = {
      id: uuidv4(),
      content,
      routingKey,
      timestamp: new Date(),
      exchangeId,
      status: 'published'
    };

    setState(prev => {
      const exchange = prev.exchanges.find(e => e.id === exchangeId);
      if (!exchange) return prev;

      // Route message based on exchange type
      const routedQueues: string[] = [];

      if (exchange.type === 'direct') {
        // Direct: exact routing key match
        routedQueues.push(...prev.bindings
          .filter(b => b.exchangeId === exchangeId && b.routingKey === routingKey)
          .map(b => b.queueId));
      } else if (exchange.type === 'fanout') {
        // Fanout: route to all bound queues
        routedQueues.push(...prev.bindings
          .filter(b => b.exchangeId === exchangeId)
          .map(b => b.queueId));
      } else if (exchange.type === 'topic') {
        // Topic: pattern matching
        routedQueues.push(...prev.bindings
          .filter(b => b.exchangeId === exchangeId && matchTopicPattern(b.routingKey, routingKey))
          .map(b => b.queueId));
      }

      // Add message to routed queues
      const updatedQueues = prev.queues.map(q => 
        routedQueues.includes(q.id)
          ? { ...q, messages: [...q.messages, { ...message, status: 'routed' as const }] }
          : q
      );

      return {
        ...prev,
        messages: [...prev.messages, message],
        queues: updatedQueues
      };
    });

    addEvent('message_published', `Message published to exchange with routing key "${routingKey}"`, 
      { messageId: message.id, exchangeId, routingKey });

    // Simulate auto-consumption
    setTimeout(() => {
      consumeMessage();
    }, 1000);
  }, [addEvent]);

  const consumeMessage = useCallback(() => {
    setState(prev => {
      const queueWithMessages = prev.queues.find(q => q.messages.length > 0 && q.consumers.some(c => c.isActive));
      if (!queueWithMessages) return prev;

      const message = queueWithMessages.messages[0];
      const consumer = queueWithMessages.consumers.find(c => c.isActive);
      if (!consumer) return prev;

      // Simulate rejection chance (10%)
      const isRejected = Math.random() < 0.1;

      if (isRejected && queueWithMessages.dlq) {
        // Move to DLQ
        const dlqQueue = prev.queues.find(q => q.id === queueWithMessages.dlq);
        const updatedQueues = prev.queues.map(q => {
          if (q.id === queueWithMessages.id) {
            return { ...q, messages: q.messages.slice(1) };
          }
          if (q.id === queueWithMessages.dlq) {
            return { ...q, messages: [...q.messages, { ...message, status: 'dlq' as const }] };
          }
          return q;
        });

        addEvent('message_dlq', `Message moved to Dead Letter Queue`, 
          { messageId: message.id, queueId: queueWithMessages.id });

        return { ...prev, queues: updatedQueues };
      }

      // Normal consumption
      const updatedQueues = prev.queues.map(q => 
        q.id === queueWithMessages.id
          ? { ...q, messages: q.messages.slice(1) }
          : q
      );

      const updatedConsumers = prev.consumers.map(c => 
        c.id === consumer.id
          ? { ...c, processedMessages: c.processedMessages + 1 }
          : c
      );

      addEvent(isRejected ? 'message_rejected' : 'message_consumed', 
        `Message ${isRejected ? 'rejected' : 'consumed'} by ${consumer.name}`, 
        { messageId: message.id, consumerId: consumer.id });

      return {
        ...prev,
        queues: updatedQueues,
        consumers: updatedConsumers
      };
    });
  }, [addEvent]);

  const loadDemo = useCallback(() => {
    // Clear current state
    setState({
      exchanges: [],
      queues: [],
      consumers: [],
      bindings: [],
      messages: [],
      events: []
    });

    // Create demo scenario
    setTimeout(() => {
      const exchange = createExchange('order-exchange', 'topic', { x: 200, y: 150 });
      const queue1 = createQueue('order-processing', { x: 500, y: 100 }, 'order-dlq');
      const queue2 = createQueue('notification-queue', { x: 500, y: 200 });
      const dlq = createQueue('order-dlq', { x: 800, y: 100 });
      
      setTimeout(() => {
        createBinding(exchange.id, queue1.id, 'order.*');
        createBinding(exchange.id, queue2.id, 'order.created');
        createConsumer('Order Processor', queue1.id, { x: 750, y: 100 });
        createConsumer('Notification Service', queue2.id, { x: 750, y: 200 });

        // Publish demo messages
        setTimeout(() => {
          publishMessage(exchange.id, 'New order #1234', 'order.created');
          setTimeout(() => publishMessage(exchange.id, 'Order #1234 updated', 'order.updated'), 2000);
        }, 1000);
      }, 1000);
    }, 500);
  }, [createExchange, createQueue, createConsumer, createBinding, publishMessage]);

  return {
    state,
    createExchange,
    createQueue,
    createConsumer,
    createBinding,
    publishMessage,
    consumeMessage,
    loadDemo
  };
};

// Topic pattern matching helper
function matchTopicPattern(pattern: string, routingKey: string): boolean {
  const patternParts = pattern.split('.');
  const keyParts = routingKey.split('.');

  if (patternParts.length !== keyParts.length && !pattern.includes('#')) {
    return false;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const keyPart = keyParts[i];

    if (patternPart === '#') {
      return true; // # matches any remaining parts
    }
    if (patternPart !== '*' && patternPart !== keyPart) {
      return false;
    }
  }

  return true;
}