import React, { useRef, useEffect } from 'react';
import { Volume2, CloudRain, Cpu, Keyboard, Wind, Sparkles } from 'lucide-react';

export interface SoundSource {
  id: string;
  name: string;
  icon: 'rain' | 'space' | 'forest' | 'keyboard' | 'wind';
  color: string;
  description: string;
  x: number; // -1 to 1
  y: number; // -1 to 1
  enabled: boolean;
  intensity: number; // 0 to 1
  detune?: number; // synth parameter
}

interface SoundCanvasProps {
  sources: SoundSource[];
  onUpdateSource: (id: string, updates: Partial<SoundSource>) => void;
}

export const SoundCanvas: React.FC<SoundCanvasProps> = ({ sources, onUpdateSource }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragSourceIdRef = useRef<string | null>(null);

  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Scale to -1 to 1 range
    let x = (clientX - centerX) / (rect.width / 2);
    let y = (clientY - centerY) / (rect.height / 2);
    
    // Clamp to circle
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
      x = x / distance;
      y = y / distance;
    }
    
    return { x, y };
  };

  const handleStartDrag = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragSourceIdRef.current = id;
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragSourceIdRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const { x, y } = getRelativeCoords(clientX, clientY);
      onUpdateSource(dragSourceIdRef.current, { x, y });
    };

    const handleEndDrag = () => {
      dragSourceIdRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [sources, onUpdateSource]);

  const renderIcon = (type: string, size = 18) => {
    switch (type) {
      case 'rain': return <CloudRain size={size} />;
      case 'space': return <Cpu size={size} />;
      case 'forest': return <Sparkles size={size} />;
      case 'keyboard': return <Keyboard size={size} />;
      case 'wind': return <Wind size={size} />;
      default: return <Volume2 size={size} />;
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Visual Canvas Panel */}
      <div 
        ref={containerRef}
        className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(15,15,25,0.4)] backdrop-blur-md flex items-center justify-center overflow-visible"
        style={{
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Concentric Circles for Distance Context */}
        <div className="absolute w-3/4 h-3/4 rounded-full border border-[rgba(255,255,255,0.03)] pointer-events-none" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-[rgba(255,255,255,0.02)] pointer-events-none" />
        <div className="absolute w-1/4 h-1/4 rounded-full border border-[rgba(255,255,255,0.02)] pointer-events-none" />
        
        {/* Crosshair grids */}
        <div className="absolute w-full h-[1px] bg-[rgba(255,255,255,0.02)] pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-[rgba(255,255,255,0.02)] pointer-events-none" />

        {/* Center Listener node */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
        </div>

        {/* Sound nodes */}
        {sources.map((source) => {
          if (!source.enabled) return null;
          
          // Map -1..1 to 0..100% position
          const left = `${((source.x + 1) / 2) * 100}%`;
          const top = `${((source.y + 1) / 2) * 100}%`;

          // Distance and pan calculations for preview labels
          const dist = Math.sqrt(source.x * source.x + source.y * source.y);
          const volPct = Math.round(Math.max(0, 1 - dist) * 100);
          const panVal = Math.round(source.x * 100);
          const panLabel = panVal > 10 ? `R${panVal}` : panVal < -10 ? `L${Math.abs(panVal)}` : 'C';

          return (
            <div
              key={source.id}
              className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all select-none group"
              style={{
                left,
                top,
                backgroundColor: source.color,
                boxShadow: `0 0 16px ${source.color}, inset 0 2px 4px rgba(255,255,255,0.3)`
              }}
              onMouseDown={(e) => handleStartDrag(source.id, e)}
              onTouchStart={(e) => handleStartDrag(source.id, e)}
            >
              <div className="text-black flex items-center justify-center font-bold">
                {renderIcon(source.icon, 20)}
              </div>
              
              {/* Tooltip Overlay */}
              <div className="absolute bottom-12 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded px-2.5 py-1 text-[10px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 flex flex-col items-center">
                <span className="font-semibold text-white">{source.name}</span>
                <span className="text-[rgba(255,255,255,0.6)]">Vol: {volPct}% · Pan: {panLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-[11px] text-[var(--text-secondary)] mt-4 font-mono">
        Drag sound icons to position them relative to the central listener.
      </p>
    </div>
  );
};
