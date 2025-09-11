import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Send } from 'lucide-react';
import { useSimulator } from '@/hooks/useSimulator';

interface PublishPanelProps {
  simulator: ReturnType<typeof useSimulator>;
}

export const PublishPanel: React.FC<PublishPanelProps> = ({ simulator }) => {
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [routingKey, setRoutingKey] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');

  const handlePublish = () => {
    if (!selectedExchange || !messageContent) return;
    
    simulator.publishMessage(selectedExchange, messageContent, routingKey || '');
    
    // Clear form
    setMessageContent('');
    setRoutingKey('');
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Publish Message</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exchange" className="text-xs">Exchange</Label>
          <Select value={selectedExchange} onValueChange={setSelectedExchange}>
            <SelectTrigger id="exchange">
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
            <SelectContent>
              {simulator.state.exchanges.map(exchange => (
                <SelectItem key={exchange.id} value={exchange.id}>
                  {exchange.name} ({exchange.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="routing-key" className="text-xs">Routing Key</Label>
          <Input
            id="routing-key"
            value={routingKey}
            onChange={(e) => setRoutingKey(e.target.value)}
            placeholder="e.g., order.created"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-xs">Message Content</Label>
          <Textarea
            id="message"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Enter your message..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handlePublish}
          disabled={!selectedExchange || !messageContent}
          className="w-full bg-gradient-to-r from-message to-message/80 hover:opacity-90"
        >
          <Send className="w-4 h-4 mr-2" />
          Publish Message
        </Button>

        {simulator.state.exchanges.length === 0 && (
          <div className="text-center text-muted-foreground text-xs p-4 border border-dashed rounded-lg">
            Create an exchange first to publish messages
          </div>
        )}
      </CardContent>
    </Card>
  );
};