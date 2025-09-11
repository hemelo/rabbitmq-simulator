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
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RabbitMQ Simulator
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Visual message queue simulator with real-time flow visualization
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              onClick={simulator.loadDemo}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 flex-1 sm:flex-none"
            >
              <Play className="w-4 h-4 mr-2" />
              Load Demo
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[80vh]">
          {/* Component Palette - Responsive positioning */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ComponentPalette simulator={simulator} />
          </div>

          {/* Workspace - Takes most space */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <Workspace simulator={simulator} />
          </div>

          {/* Side Panels - Stack on mobile */}
          <div className="lg:col-span-3 order-3 space-y-6">
            <PublishPanel simulator={simulator} />
            <EventLog events={simulator.state.events} />
          </div>
        </div>
      </div>
    </div>
  );
};