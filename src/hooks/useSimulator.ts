import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Engine } from '@/core/engine';

export const useSimulator = () => {
  const engine = useMemo(() => new Engine({ autoConsumeIntervalMs: 1000, rejectProbability: 0.1 }), []);
  const [state, setState] = useState<SimulatorState>(engine.getState());

  useEffect(() => {
    const unsub = engine.subscribe(setState);
    engine.resume();
    return () => {
      unsub();
    };
  }, [engine]);

  const createExchange = useCallback((name: string, type: ExchangeType, position: Position) => engine.createExchange(name, type, position), [engine]);
  const createQueue = useCallback((name: string, position: Position, dlq?: string, maxLength?: number, messageTtlMs?: number) => engine.createQueue(name, position, dlq, maxLength, messageTtlMs), [engine]);
  const createConsumer = useCallback((name: string, queueId: string, position: Position) => engine.createConsumer(name, queueId, position), [engine]);
  const createBinding = useCallback((exchangeId: string, queueId: string, routingKey: string) => engine.createBinding(exchangeId, queueId, routingKey), [engine]);
  const publishMessage = useCallback((exchangeId: string, content: string, routingKey: string) => { engine.publishMessage(exchangeId, content, routingKey); }, [engine]);
  const consumeMessage = useCallback(() => engine.consumeOnce(), [engine]);
  const moveExchange = useCallback((id: string, position: Position) => engine.moveExchange(id, position), [engine]);
  const moveQueue = useCallback((id: string, position: Position) => engine.moveQueue(id, position), [engine]);
  const moveConsumer = useCallback((id: string, position: Position) => engine.moveConsumer(id, position), [engine]);
  const deleteExchange = useCallback((id: string) => engine.deleteExchange(id), [engine]);
  const deleteQueue = useCallback((id: string) => engine.deleteQueue(id), [engine]);
  const deleteConsumer = useCallback((id: string) => engine.deleteConsumer(id), [engine]);

  // Rename methods
  const renameExchange = useCallback((id: string, newName: string) => engine.renameExchange(id, newName), [engine]);
  const renameQueue = useCallback((id: string, newName: string) => engine.renameQueue(id, newName), [engine]);
  const renameConsumer = useCallback((id: string, newName: string) => engine.renameConsumer(id, newName), [engine]);

  const loadDemo = useCallback((demoType: string = 'ecommerce') => {
    engine.load({ exchanges: [], queues: [], consumers: [], bindings: [], messages: [], events: [], activeFlows: [] });
    engine.setCurrentDemo(demoType);

    switch (demoType) {
      case 'ecommerce':
        loadEcommerceDemo(engine);
        break;
      case 'microservices':
        loadMicroservicesDemo(engine);
        break;
      case 'fanout':
        loadFanoutDemo(engine);
        break;
      case 'dlq':
        loadDLQDemo(engine);
        break;
      case 'scaling':
        loadScalingDemo(engine);
        break;
      default:
        loadEcommerceDemo(engine);
    }
  }, [engine]);

  // E-commerce Order Processing Demo
  const loadEcommerceDemo = (engine: Engine) => {
    setTimeout(() => {
      const exchange = engine.createExchange('order-exchange', 'topic', { x: 200, y: 150 });
      const queue1 = engine.createQueue('order-processing', { x: 500, y: 100 }, 'order-dlq');
      const queue2 = engine.createQueue('notification-queue', { x: 500, y: 200 });
      engine.createQueue('order-dlq', { x: 800, y: 100 });

      setTimeout(() => {
        engine.createBinding(exchange.id, queue1.id, 'order.*');
        engine.createBinding(exchange.id, queue2.id, 'order.created');
        engine.createConsumer('Order Processor', queue1.id, { x: 750, y: 100 });
        engine.createConsumer('Notification Service', queue2.id, { x: 750, y: 200 });

      }, 1000);
    }, 500);
  };

  // Microservices Communication Demo
  const loadMicroservicesDemo = (engine: Engine) => {
    setTimeout(() => {
      const userExchange = engine.createExchange('user-service', 'direct', { x: 150, y: 100 });
      const orderExchange = engine.createExchange('order-service', 'direct', { x: 150, y: 250 });
      const paymentExchange = engine.createExchange('payment-service', 'direct', { x: 150, y: 400 });

      const userQueue = engine.createQueue('user-events', { x: 450, y: 100 });
      const orderQueue = engine.createQueue('order-events', { x: 450, y: 250 });
      const paymentQueue = engine.createQueue('payment-events', { x: 450, y: 400 });
      const auditQueue = engine.createQueue('audit-log', { x: 450, y: 350 });

      setTimeout(() => {
        engine.createBinding(userExchange.id, userQueue.id, 'user.created');
        engine.createBinding(orderExchange.id, orderQueue.id, 'order.created');
        engine.createBinding(paymentExchange.id, paymentQueue.id, 'payment.processed');
        engine.createBinding(userExchange.id, auditQueue.id, 'user.*');
        engine.createBinding(orderExchange.id, auditQueue.id, 'order.*');
        engine.createBinding(paymentExchange.id, auditQueue.id, 'payment.*');

        engine.createConsumer('User Service', userQueue.id, { x: 700, y: 100 });
        engine.createConsumer('Order Service', orderQueue.id, { x: 700, y: 250 });
        engine.createConsumer('Payment Service', paymentQueue.id, { x: 700, y: 400 });
        engine.createConsumer('Audit Logger', auditQueue.id, { x: 700, y: 350 });

      }, 1000);
    }, 500);
  };

  // Fanout Broadcasting Demo
  const loadFanoutDemo = (engine: Engine) => {
    setTimeout(() => {
      const newsExchange = engine.createExchange('news-broadcast', 'fanout', { x: 200, y: 200 });
      const emailQueue = engine.createQueue('email-notifications', { x: 500, y: 100 });
      const smsQueue = engine.createQueue('sms-notifications', { x: 500, y: 200 });
      const pushQueue = engine.createQueue('push-notifications', { x: 500, y: 300 });

      setTimeout(() => {
        engine.createBinding(newsExchange.id, emailQueue.id, '');
        engine.createBinding(newsExchange.id, smsQueue.id, '');
        engine.createBinding(newsExchange.id, pushQueue.id, '');

        engine.createConsumer('Email Service', emailQueue.id, { x: 750, y: 100 });
        engine.createConsumer('SMS Service', smsQueue.id, { x: 750, y: 200 });
        engine.createConsumer('Push Service', pushQueue.id, { x: 750, y: 300 });

      }, 1000);
    }, 500);
  };

  // Dead Letter Queue Demo
  const loadDLQDemo = (engine: Engine) => {
    setTimeout(() => {
      const exchange = engine.createExchange('task-exchange', 'direct', { x: 200, y: 200 });
      const taskQueue = engine.createQueue('task-queue', { x: 500, y: 150 }, 'task-dlq', 3, 5000);
      const dlq = engine.createQueue('task-dlq', { x: 500, y: 300 });

      setTimeout(() => {
        engine.createBinding(exchange.id, taskQueue.id, 'task.process');
        engine.createConsumer('Task Processor', taskQueue.id, { x: 750, y: 150 });
        engine.createConsumer('DLQ Handler', dlq.id, { x: 750, y: 300 });

    }, 1000);
    }, 500);
  };

  // Load Balancing & Scaling Demo
  const loadScalingDemo = (engine: Engine) => {
    setTimeout(() => {
      const exchange = engine.createExchange('work-exchange', 'direct', { x: 200, y: 200 });
      const workQueue = engine.createQueue('work-queue', { x: 500, y: 200 });
      
      setTimeout(() => {
        engine.createBinding(exchange.id, workQueue.id, 'work.job');
        
        // Multiple consumers for load balancing
        engine.createConsumer('Worker 1', workQueue.id, { x: 750, y: 150 });
        engine.createConsumer('Worker 2', workQueue.id, { x: 750, y: 200 });
        engine.createConsumer('Worker 3', workQueue.id, { x: 750, y: 250 });

      }, 1000);
    }, 500);
  };

  // Additional control APIs for UI expansion
  const resume = useCallback(() => engine.resume(), [engine]);
  const restart = useCallback(() => {
    engine.load({ exchanges: [], queues: [], consumers: [], bindings: [], messages: [], events: [], activeFlows: [] });
    engine.setCurrentDemo(null);
  }, [engine]);
  const exportState = useCallback(() => engine.serialize(), [engine]);
  const importState = useCallback((s: SimulatorState) => engine.load(s), [engine]);

  return {
    state,
    createExchange,
    createQueue,
    createConsumer,
    createBinding,
    publishMessage,
    consumeMessage,
    loadDemo,
    moveExchange,
    moveQueue,
    moveConsumer,
    deleteExchange,
    deleteQueue,
    deleteConsumer,
    renameExchange,
    renameQueue,
    renameConsumer,
    resume,
    restart,
    exportState,
    importState
  };
};