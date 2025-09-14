import React, { useState } from 'react';
import { Workspace } from './simulator/Workspace';
import { ComponentPalette } from './simulator/ComponentPalette';
import { EventLog } from './simulator/EventLog';
import { PublishPanel } from './simulator/PublishPanel';
import { HelpModal } from './HelpModal';
import { Footer } from './Footer';
import { useSimulator } from '@/hooks/useSimulator';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, RefreshCw, Download, Upload, HelpCircle, Maximize, RotateCcw } from 'lucide-react';

const DEMO_OPTIONS = [
  { value: 'ecommerce', label: '🛒 E-commerce Orders', description: 'Topic routing for order processing' },
  { value: 'microservices', label: '🏗️ Microservices', description: 'Service-to-service communication' },
  { value: 'fanout', label: '📢 Fanout Broadcasting', description: 'One-to-many message distribution' },
  { value: 'dlq', label: '💀 Dead Letter Queue', description: 'Error handling and retry patterns' },
  { value: 'scaling', label: '⚖️ Load Balancing', description: 'Multiple consumers for scaling' }
];

export const RabbitMQSimulator = () => {
  const simulator = useSimulator();
  const [selectedDemo, setSelectedDemo] = useState('ecommerce');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for fullscreen toggle
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground flex flex-col">
      <div className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 flex-1 flex flex-col min-h-0">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RabbitMQ Simulator
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Visual message queue simulator with real-time flow visualization
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHelpOpen(true)}
              className="ml-4"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </div>
          <div className="flex gap-1 w-full sm:w-auto flex-wrap">
            <div className="flex gap-1 flex-1 sm:flex-none">
              <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select demo" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_OPTIONS.map((demo) => (
                    <SelectItem key={demo.value} value={demo.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{demo.label}</span>
                        <span className="text-xs text-muted-foreground">{demo.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => simulator.loadDemo(selectedDemo)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="sm"
              >
                <Play className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Load Demo</span>
              </Button>
            </div>
            <Button 
              variant="outline"
              onClick={simulator.resume}
              size="sm"
            >
              <Play className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Play</span>
            </Button>
            <Button 
              variant="outline"
              onClick={simulator.restart}
              size="sm"
            >
              <RotateCcw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const data = simulator.exportState();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rabbit-sim.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              size="sm"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const data = JSON.parse(text);
                  simulator.importState(data);
                };
                input.click();
              }}
              size="sm"
            >
              <Upload className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button 
              variant="outline"
              onClick={toggleFullscreen}
              size="sm"
              title="F11"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 sm:mr-2" /> : <Maximize className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit FS" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>

        {/* Main Layout - Responsive Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left Sidebar - Component Palette */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ComponentPalette simulator={simulator} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Workspace - Takes most space */}
            <div className="flex-1 min-h-0">
              <Workspace simulator={simulator} />
            </div>
            
            {/* Bottom Panel - Publish and Events */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6  flex-shrink-0">
              <PublishPanel simulator={simulator} />
              <EventLog events={simulator.state.events} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full relative">
        <Footer />
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};