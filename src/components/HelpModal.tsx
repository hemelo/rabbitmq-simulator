import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { HelpCircle, X, Database, Share2, Users, Layers, ArrowRight, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONCEPTS = [
  {
    id: 'exchanges',
    title: 'Exchanges',
    icon: Share2,
    description: 'Exchanges are message routing agents that receive messages from producers and route them to queues based on rules.',
    types: [
      {
        name: 'Direct',
        description: 'Routes messages to queues based on exact routing key matches',
        example: 'order.created → order-queue',
        color: 'bg-orange-500'
      },
      {
        name: 'Topic',
        description: 'Routes messages using pattern matching with wildcards (* and #)',
        example: 'order.* → order-queue, notification.# → all notification queues',
        color: 'bg-blue-500'
      },
      {
        name: 'Fanout',
        description: 'Routes messages to all bound queues, ignoring routing keys',
        example: 'news → email-queue, sms-queue, push-queue',
        color: 'bg-green-500'
      }
    ]
  },
  {
    id: 'queues',
    title: 'Queues',
    icon: Database,
    description: 'Queues store messages until they are consumed by consumers. They act as buffers between producers and consumers.',
    features: [
      'Message persistence and durability',
      'Dead Letter Queue (DLQ) for failed messages',
      'Message TTL (Time To Live)',
      'Queue length limits',
      'Priority handling'
    ],
    color: 'bg-purple-500'
  },
  {
    id: 'consumers',
    title: 'Consumers',
    icon: Users,
    description: 'Consumers process messages from queues. They can be active or inactive, and multiple consumers can process from the same queue for load balancing.',
    features: [
      'Load balancing across multiple consumers',
      'Message acknowledgment',
      'Prefetch count for batch processing',
      'Consumer tags for identification'
    ],
    color: 'bg-cyan-500'
  },
  {
    id: 'bindings',
    title: 'Bindings',
    icon: ArrowRight,
    description: 'Bindings are rules that connect exchanges to queues. They define how messages are routed based on routing keys.',
    features: [
      'Routing key patterns',
      'Exchange-to-queue relationships',
      'Wildcard matching for topic exchanges',
      'Binding arguments for advanced routing'
    ],
    color: 'bg-indigo-500'
  },
  {
    id: 'dlq',
    title: 'Dead Letter Queue',
    icon: AlertTriangle,
    description: 'A special queue that receives messages that cannot be processed normally due to errors, TTL expiration, or queue limits.',
    useCases: [
      'Failed message handling',
      'Retry mechanisms',
      'Error analysis and debugging',
      'Message auditing'
    ],
    color: 'bg-red-500'
  }
];

const PATTERNS = [
  {
    name: 'Request-Response',
    description: 'Synchronous communication pattern where a service waits for a response',
    useCase: 'API calls, user authentication'
  },
  {
    name: 'Publish-Subscribe',
    description: 'Asynchronous pattern where multiple subscribers receive the same message',
    useCase: 'Event notifications, real-time updates'
  },
  {
    name: 'Work Queues',
    description: 'Distribute time-consuming tasks among multiple workers',
    useCase: 'Image processing, email sending, data analysis'
  },
  {
    name: 'Routing',
    description: 'Route messages to different queues based on routing keys',
    useCase: 'Log filtering, error handling, priority processing'
  },
  {
    name: 'Topics',
    description: 'Route messages based on pattern matching with wildcards',
    useCase: 'Stock prices, sensor data, user activity'
  }
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            RabbitMQ Concepts Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Core Concepts */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Core Concepts</h2>
            <div className="grid gap-4">
              {CONCEPTS.map((concept) => {
                const Icon = concept.icon;
                return (
                  <div key={concept.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${concept.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{concept.title}</h3>
                        <p className="text-muted-foreground text-sm">{concept.description}</p>
                      </div>
                    </div>

                    {concept.types && (
                      <div className="space-y-2">
                        {concept.types.map((type, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <Badge className={`${type.color} text-white`}>{type.name}</Badge>
                            <span className="text-sm">{type.description}</span>
                            <code className="text-xs bg-muted px-1 rounded">{type.example}</code>
                          </div>
                        ))}
                      </div>
                    )}

                    {concept.features && (
                      <div className="space-y-1">
                        {concept.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {concept.useCases && (
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm mt-2">Use Cases:</h4>
                        {concept.useCases.map((useCase, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span>{useCase}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Common Patterns */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Common Patterns</h2>
            <div className="grid gap-3">
              {PATTERNS.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold mb-2">{pattern.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{pattern.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Use Case</Badge>
                    <span className="text-sm">{pattern.useCase}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Best Practices</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600">✅ Do</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                    <span>Use meaningful queue and exchange names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                    <span>Implement proper error handling with DLQ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                    <span>Set appropriate message TTL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                    <span>Use idempotent message processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                    <span>Monitor queue depths and consumer lag</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-red-600">❌ Don't</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2" />
                    <span>Create too many queues or exchanges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2" />
                    <span>Ignore message acknowledgments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2" />
                    <span>Use fanout for single-consumer scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2" />
                    <span>Process messages synchronously when possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2" />
                    <span>Forget to handle connection failures</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">💡 Pro Tips</h2>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Start with simple patterns and gradually add complexity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use topic exchanges for flexible routing patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Implement circuit breakers for external service calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use message correlation IDs for request-response patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Test your message flows with different failure scenarios</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
