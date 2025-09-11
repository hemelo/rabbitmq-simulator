import React from 'react';
import { Workspace } from './simulator/Workspace';
import { ComponentPalette } from './simulator/ComponentPalette';
import { EventLog } from './simulator/EventLog';
import { PublishPanel } from './simulator/PublishPanel';
import { useSimulator } from '@/hooks/useSimulator';
import { Button } from './ui/button';
import { Play, RefreshCw } from 'lucide-react';

export const RabbitMQSimulator = () => {
  const simulator = useSimulator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RabbitMQ Simulator
            </h1>
            <p className="text-muted-foreground mt-1">
              Visual message queue simulator with real-time flow visualization
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={simulator.loadDemo}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Play className="w-4 h-4 mr-2" />
              Load Demo
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6 min-h-[80vh]">
          {/* Component Palette */}
          <div className="col-span-2">
            <ComponentPalette simulator={simulator} />
          </div>

          {/* Workspace */}
          <div className="col-span-7">
            <Workspace simulator={simulator} />
          </div>

          {/* Side Panels */}
          <div className="col-span-3 space-y-6">
            <PublishPanel simulator={simulator} />
            <EventLog events={simulator.state.events} />
          </div>
        </div>
      </div>
    </div>
  );
};