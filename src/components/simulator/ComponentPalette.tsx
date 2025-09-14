import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Share2, Layers, Users, Database } from 'lucide-react';
import { useSimulator } from '@/hooks/useSimulator';

interface ComponentPaletteProps {
  simulator: ReturnType<typeof useSimulator>;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ simulator }) => {
  const isSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /safari/i.test(ua) && !/chrome|crios|android/i.test(ua);
  }, []);

  const startGhostDrag = (e: React.PointerEvent, payload: Record<string, string>) => {
    e.preventDefault();
    const ghost = document.createElement('div');
    ghost.style.position = 'fixed';
    ghost.style.left = `${e.clientX + 10}px`;
    ghost.style.top = `${e.clientY + 10}px`;
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '9999';
    ghost.style.padding = '4px 8px';
    ghost.style.borderRadius = '6px';
    ghost.style.fontSize = '12px';
    ghost.style.background = 'rgba(0,0,0,0.6)';
    ghost.style.color = 'white';
    ghost.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    ghost.textContent = payload.componentType;
    document.body.appendChild(ghost);

    const onMove = (ev: PointerEvent) => {
      ghost.style.left = `${ev.clientX + 10}px`;
      ghost.style.top = `${ev.clientY + 10}px`;
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp, true);
      ghost.remove();
      const detail = { clientX: ev.clientX, clientY: ev.clientY, payload };
      document.dispatchEvent(new CustomEvent('ghost-drag-end', { detail }));
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, true);
  };
  const [queueMaxLen, setQueueMaxLen] = useState<string>('');
  const [queueTtl, setQueueTtl] = useState<string>('');

  const handleDragStart = (e: React.DragEvent, componentType: string, exchangeType?: string) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.setData('componentName', '');
    if (exchangeType) {
      e.dataTransfer.setData('exchangeType', exchangeType);
    }
    if (componentType === 'queue') {
      if (queueMaxLen) e.dataTransfer.setData('queueMaxLength', queueMaxLen);
      if (queueTtl) e.dataTransfer.setData('queueTtl', queueTtl);
    }
    // Also provide a text/plain payload for browsers that only expose this
    const payload: Record<string, string> = { componentType };
    if (exchangeType) payload.exchangeType = exchangeType;
    if (queueMaxLen) payload.queueMaxLength = queueMaxLen;
    if (queueTtl) payload.queueTtl = queueTtl;
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    } catch {
      try { e.dataTransfer.setData('text/plain', componentType); } catch {}
    }
    // Improve cross-browser DnD behavior
    try {
      e.dataTransfer.effectAllowed = 'copy';
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 1, 1);
      }
      e.dataTransfer.setDragImage(canvas, 0, 0);
    } catch {}
  };

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Components</h3>
        <p className="text-xs text-muted-foreground">Drag to workspace</p>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto">
        {/* Exchanges */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Exchanges
          </div>
          <div className="space-y-2">
            <div
              draggable={!isSafari}
              onPointerDown={(e) => isSafari && startGhostDrag(e, { componentType: 'exchange', exchangeType: 'direct' })}
              onDragStart={(e) => !isSafari && handleDragStart(e, 'exchange', 'direct')}
              onDragEnd={(e) => e.preventDefault()}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-direct/20 border border-exchange-direct/30 cursor-grab hover:bg-exchange-direct/30 transition-colors component-bounce select-none"
            >
              <Share2 className="w-4 h-4 text-exchange-direct" />
              <span className="text-sm">Direct</span>
            </div>
            <div
              draggable={!isSafari}
              onPointerDown={(e) => isSafari && startGhostDrag(e, { componentType: 'exchange', exchangeType: 'fanout' })}
              onDragStart={(e) => !isSafari && handleDragStart(e, 'exchange', 'fanout')}
              onDragEnd={(e) => e.preventDefault()}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-fanout/20 border border-exchange-fanout/30 cursor-grab hover:bg-exchange-fanout/30 transition-colors select-none"
            >
              <Layers className="w-4 h-4 text-exchange-fanout" />
              <span className="text-sm">Fanout</span>
            </div>
            <div
              draggable={!isSafari}
              onPointerDown={(e) => isSafari && startGhostDrag(e, { componentType: 'exchange', exchangeType: 'topic' })}
              onDragStart={(e) => !isSafari && handleDragStart(e, 'exchange', 'topic')}
              onDragEnd={(e) => e.preventDefault()}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-topic/20 border border-exchange-topic/30 cursor-grab hover:bg-exchange-topic/30 transition-colors select-none"
            >
              <Share2 className="w-4 h-4 text-exchange-topic" />
              <span className="text-sm">Topic</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Queues */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Queues
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              className="px-2 py-1 text-xs rounded border bg-background"
              placeholder="Max length"
              type="number"
              min={0}
              value={queueMaxLen}
              onChange={(e) => setQueueMaxLen(e.target.value)}
            />
            <input
              className="px-2 py-1 text-xs rounded border bg-background"
              placeholder="TTL ms"
              type="number"
              min={0}
              value={queueTtl}
              onChange={(e) => setQueueTtl(e.target.value)}
            />
          </div>
          <div
            draggable={!isSafari}
            onPointerDown={(e) => isSafari && startGhostDrag(e, { componentType: 'queue', queueMaxLength: queueMaxLen, queueTtl: queueTtl })}
            onDragStart={(e) => !isSafari && handleDragStart(e, 'queue')}
            onDragEnd={(e) => e.preventDefault()}
            className="flex items-center gap-2 p-2 rounded-lg bg-queue/20 border border-queue/30 cursor-grab hover:bg-queue/30 transition-colors select-none"
          >
            <Database className="w-4 h-4 text-queue" />
            <span className="text-sm">Queue</span>
          </div>
        </div>

        <Separator />

        {/* Consumers */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Consumers
          </div>
          <div
            draggable={!isSafari}
            onPointerDown={(e) => isSafari && startGhostDrag(e, { componentType: 'consumer' })}
            onDragStart={(e) => !isSafari && handleDragStart(e, 'consumer')}
            onDragEnd={(e) => e.preventDefault()}
            className="flex items-center gap-2 p-2 rounded-lg bg-consumer/20 border border-consumer/30 cursor-grab hover:bg-consumer/30 transition-colors select-none"
          >
            <Users className="w-4 h-4 text-consumer" />
            <span className="text-sm">Consumer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};