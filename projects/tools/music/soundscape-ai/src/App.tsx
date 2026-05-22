import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Music, 
  Activity,
  Sliders,
  Terminal,
  Compass
} from 'lucide-react';
import { SoundCanvas, SoundSource } from './components/SoundCanvas';

// Initial preset sources
const INITIAL_SOURCES: SoundSource[] = [
  {
    id: 'rain',
    name: 'Rainy Cyberpunk',
    icon: 'rain',
    color: '#00f0ff', // Cyber Cyan
    description: 'Procedural rain crackle with low-frequency hovercar resonance.',
    x: -0.4,
    y: 0.3,
    enabled: true,
    intensity: 0.6
  },
  {
    id: 'space',
    name: 'Deep Space Pad',
    icon: 'space',
    color: '#bf5af2', // Neon Purple
    description: 'Slow-sweeping, detuned multi-oscillator drone.',
    x: 0.5,
    y: -0.4,
    enabled: true,
    intensity: 0.5
  },
  {
    id: 'forest',
    name: 'Meditative Forest',
    icon: 'forest',
    color: '#30d158', // Forest Green
    description: 'Lush FM bird sweeps and delicate wind rustles.',
    x: -0.6,
    y: -0.5,
    enabled: false,
    intensity: 0.4
  },
  {
    id: 'keyboard',
    name: 'Keyboard Echoes',
    icon: 'keyboard',
    color: '#ffd60a', // Cozy Amber
    description: 'Organic mechanical keyplucks echoing through delay.',
    x: 0.3,
    y: 0.6,
    enabled: true,
    intensity: 0.5
  },
  {
    id: 'wind',
    name: 'Solar Wind',
    icon: 'wind',
    color: '#ff9f0a', // Warm Orange
    description: 'High-resonance bandpass white noise sweeps.',
    x: 0.0,
    y: -0.7,
    enabled: false,
    intensity: 0.4
  }
];

export default function App() {
  const [sources, setSources] = useState<SoundSource[]>(INITIAL_SOURCES);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState<string>('Ready for input...');
  const [aiLogs, setAiLogs] = useState<string[]>([
    'System: Audio Synthesis Engine Ready.',
    'System: Standard stereo spatializer active.',
    'System: Waiting for prompt command...'
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Per-source Web Audio node references stored in refs to allow instant spatial updates
  const nodesRef = useRef<{
    [key: string]: {
      gain: GainNode;
      panner: StereoPannerNode;
      oscillators?: any[];
      noiseSource?: AudioBufferSourceNode;
      intervalId?: any;
      filter?: BiquadFilterNode;
      lfo?: OscillatorNode;
    };
  }>({});

  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sound Buffer Generators
  const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'brown') => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate volume loss
      } else {
        data[i] = white;
      }
    }
    return buffer;
  };

  // Start Audio Engine
  const startAudio = () => {
    if (isPlaying) return;

    // 1. Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // 2. Setup Master Nodes
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);
    masterGainRef.current = masterGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Connect: MasterGain -> Analyser -> Destination
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // 3. Initialize all enabled sources
    sources.forEach(src => {
      if (src.enabled) {
        initSourceNode(ctx, masterGain, src);
      }
    });

    setIsPlaying(true);
    startVisualizer();
    addLog('System: Audio Context Activated. Synthesis begun.');
  };

  // Stop Audio Engine
  const stopAudio = () => {
    if (!isPlaying) return;

    // Stop and clear all synthesis nodes
    Object.keys(nodesRef.current).forEach(id => {
      clearSourceNodes(id);
    });
    nodesRef.current = {};

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsPlaying(false);
    addLog('System: Synthesis stopped. Audio Context suspended.');
  };

  // Helper to clear a sound node
  const clearSourceNodes = (id: string) => {
    const nodeSet = nodesRef.current[id];
    if (!nodeSet) return;

    try {
      if (nodeSet.oscillators) {
        nodeSet.oscillators.forEach(osc => osc.stop());
      }
      if (nodeSet.noiseSource) {
        nodeSet.noiseSource.stop();
      }
      if (nodeSet.lfo) {
        nodeSet.lfo.stop();
      }
      if (nodeSet.intervalId) {
        clearInterval(nodeSet.intervalId);
      }
      nodeSet.gain.disconnect();
      nodeSet.panner.disconnect();
    } catch (e) {
      // safe ignore
    }
    delete nodesRef.current[id];
  };

  // Setup specific sound node synthesis parameters
  const initSourceNode = (ctx: AudioContext, destination: AudioNode, src: SoundSource) => {
    // Clear existing if any
    clearSourceNodes(src.id);

    // Create primary spatial control nodes
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();
    
    // Map initial coords
    const dist = Math.sqrt(src.x * src.x + src.y * src.y);
    const calculatedVolume = Math.max(0, 1 - dist) * src.intensity;
    
    panner.pan.setValueAtTime(src.x, ctx.currentTime);
    gain.gain.setValueAtTime(calculatedVolume, ctx.currentTime);

    // Connect spatial nodes to master
    gain.connect(panner);
    panner.connect(destination);

    const nodeSet: any = { gain, panner };

    if (src.id === 'rain') {
      // Rain Synthesizer: high-passed brown noise + random raindrops (plucks)
      const noiseBuffer = createNoiseBuffer(ctx, 'brown');
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      noiseSource.start();

      nodeSet.noiseSource = noiseSource;
      nodeSet.filter = filter;

      // Clicky individual raindrops using a periodic timer
      const rainInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          
          clickOsc.type = 'sine';
          // randomize raindrop pitches
          clickOsc.frequency.setValueAtTime(1000 + Math.random() * 2000, ctx.currentTime);
          
          clickGain.gain.setValueAtTime(0.001, ctx.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(0.08 * src.intensity, ctx.currentTime + 0.01);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

          clickOsc.connect(clickGain);
          clickGain.connect(gain);
          clickOsc.start();
          clickOsc.stop(ctx.currentTime + 0.1);
        }
      }, 120);

      nodeSet.intervalId = rainInterval;

    } else if (src.id === 'space') {
      // Space Pad Synthesizer: 4 detuned chord oscillators + filter sweep LFO
      const chordFrequencies = [65.41, 130.81, 196.00, 246.94]; // C2, C3, G3, B3 chord
      const oscillators: OscillatorNode[] = [];

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      chordFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // detune slightly for warm chorus effect
        osc.detune.setValueAtTime((Math.random() - 0.5) * 20, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        oscillators.push(osc);
      });

      // LFO to sweep filter cutoff back and forth
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // 0.06 Hz slow wave
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, ctx.currentTime); // sweep range

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      filter.connect(gain);

      nodeSet.oscillators = oscillators;
      nodeSet.lfo = lfo;
      nodeSet.filter = filter;

    } else if (src.id === 'forest') {
      // Meditative Forest Synth: Slow ambient wind noise + FM bird chirping loop
      const windBuffer = createNoiseBuffer(ctx, 'white');
      const windSource = ctx.createBufferSource();
      windSource.buffer = windBuffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(500, ctx.currentTime);
      windFilter.Q.setValueAtTime(4, ctx.currentTime);

      windSource.connect(windFilter);
      windFilter.connect(gain);
      windSource.start();

      nodeSet.noiseSource = windSource;
      nodeSet.filter = windFilter;

      // Slow wind modulation LFO
      const windLfo = ctx.createOscillator();
      windLfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(250, ctx.currentTime);
      
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();
      nodeSet.lfo = windLfo;

      // Periodic Bird chirping engine
      const triggerBirdChirp = () => {
        if (!audioCtxRef.current || !isPlaying) return;
        const now = audioCtxRef.current.currentTime;

        const numChirps = 3 + Math.floor(Math.random() * 4);
        let chirpTime = now;

        for (let i = 0; i < numChirps; i++) {
          const birdOsc = ctx.createOscillator();
          const birdGain = ctx.createGain();

          birdOsc.type = 'sine';
          birdOsc.frequency.setValueAtTime(2200 + Math.random() * 400, chirpTime);
          // pitch sweeps up quickly
          birdOsc.frequency.exponentialRampToValueAtTime(3500 + Math.random() * 500, chirpTime + 0.05);

          birdGain.gain.setValueAtTime(0.0001, chirpTime);
          birdGain.gain.exponentialRampToValueAtTime(0.08 * src.intensity, chirpTime + 0.01);
          birdGain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.06);

          birdOsc.connect(birdGain);
          birdGain.connect(gain);
          birdOsc.start(chirpTime);
          birdOsc.stop(chirpTime + 0.07);

          chirpTime += 0.08 + Math.random() * 0.05;
        }
      };

      const birdInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          triggerBirdChirp();
        }
      }, 5000); // Check every 5 seconds

      nodeSet.intervalId = birdInterval;

    } else if (src.id === 'keyboard') {
      // Keyboard Echoes Synth: Delicately triggered plucks run through a feedback delay line
      const delay = ctx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.35, ctx.currentTime); // 350ms delay echo

      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.45, ctx.currentTime); // feedback amount

      // Connect pluck -> delay -> gain -> master
      // And delay -> feedback -> delay loop
      delay.connect(gain);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);

      const triggerKeyPluck = () => {
        if (!audioCtxRef.current || !isPlaying) return;
        const now = audioCtxRef.current.currentTime;

        // Pentatonic scale degrees for relaxing echoes
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // C4, D4, E4, G4, A4, C5, D5
        const randomNote = notes[Math.floor(Math.random() * notes.length)];

        const keyOsc = ctx.createOscillator();
        const keyGain = ctx.createGain();

        // Round physical click sound
        keyOsc.type = 'triangle';
        keyOsc.frequency.setValueAtTime(randomNote, now);
        
        keyGain.gain.setValueAtTime(0.0001, now);
        keyGain.gain.exponentialRampToValueAtTime(0.15 * src.intensity, now + 0.005);
        keyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        keyOsc.connect(keyGain);
        
        // Feed into delay AND direct master gain
        keyGain.connect(gain);
        keyGain.connect(delay);

        keyOsc.start(now);
        keyOsc.stop(now + 0.15);
      };

      const keyboardInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          triggerKeyPluck();
        }
      }, 1500);

      nodeSet.intervalId = keyboardInterval;

    } else if (src.id === 'wind') {
      // Solar Wind Synth: resonant white noise filtered via sweeping Bandpass
      const noiseBuffer = createNoiseBuffer(ctx, 'white');
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      bpFilter.Q.setValueAtTime(15, ctx.currentTime); // High resonance for whistle

      noiseSource.connect(bpFilter);
      bpFilter.connect(gain);
      noiseSource.start();

      nodeSet.noiseSource = noiseSource;
      nodeSet.filter = bpFilter;

      // Whistling wind sweep LFO
      const windLfo = ctx.createOscillator();
      windLfo.frequency.setValueAtTime(0.03, ctx.currentTime); // very slow sweep
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(600, ctx.currentTime); // sweeps from 400Hz to 1600Hz

      windLfo.connect(windLfoGain);
      windLfoGain.connect(bpFilter.frequency);
      windLfo.start();
      nodeSet.lfo = windLfo;
    }

    nodesRef.current[src.id] = nodeSet;
  };

  // Sync spatial parameters whenever position changes
  const updateSpatialAudio = (src: SoundSource) => {
    const nodeSet = nodesRef.current[src.id];
    if (!nodeSet) return;

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const dist = Math.sqrt(src.x * src.x + src.y * src.y);
    const calculatedVolume = Math.max(0, 1 - dist) * src.intensity;

    // Smooth value changes to prevent popping clicks
    nodeSet.panner.pan.setTargetAtTime(src.x, ctx.currentTime, 0.1);
    nodeSet.gain.gain.setTargetAtTime(calculatedVolume, ctx.currentTime, 0.1);
  };

  // Real-time Frequency visualizer renderer
  const startVisualizer = () => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Gradient color matching glassmorphic neon design
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(15, 10, 30, 0.2)');
      gradient.addColorStop(0.5, '#bf5af2');
      gradient.addColorStop(1, '#00f0ff');

      ctx.fillStyle = 'rgba(5, 5, 8, 0.5)';
      ctx.fillRect(0, 0, width, height);

      // Draw modern frequency bars
      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.95;

        ctx.fillStyle = gradient;
        // rounded corner glowing rectangles
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // Log handler
  const addLog = (message: string) => {
    setAiLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Modify sound parameters safely
  const handleUpdateSource = (id: string, updates: Partial<SoundSource>) => {
    setSources(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        
        // If sound is toggled enabled/disabled during playback
        if (isPlaying) {
          if (updates.enabled !== undefined) {
            if (updated.enabled) {
              if (audioCtxRef.current && masterGainRef.current) {
                initSourceNode(audioCtxRef.current, masterGainRef.current, updated);
              }
            } else {
              clearSourceNodes(id);
            }
          } else {
            // position or intensity modified, sync parameters
            updateSpatialAudio(updated);
          }
        }
        return updated;
      }
      return s;
    }));
  };

  // Preset Selection
  const applyPreset = (presetName: string) => {
    let presetSources: SoundSource[] = [];

    switch (presetName) {
      case 'cyberpunk':
        presetSources = INITIAL_SOURCES.map(s => {
          if (s.id === 'rain') return { ...s, enabled: true, intensity: 0.9, x: -0.2, y: 0.1 };
          if (s.id === 'space') return { ...s, enabled: true, intensity: 0.6, x: 0.6, y: -0.2 };
          if (s.id === 'keyboard') return { ...s, enabled: true, intensity: 0.7, x: 0.4, y: 0.5 };
          return { ...s, enabled: false };
        });
        addLog('Preset Applied: Rainy Cyberpunk Alley.');
        break;
      case 'deepspace':
        presetSources = INITIAL_SOURCES.map(s => {
          if (s.id === 'space') return { ...s, enabled: true, intensity: 0.95, x: 0.0, y: -0.1 };
          if (s.id === 'wind') return { ...s, enabled: true, intensity: 0.8, x: 0.5, y: -0.5 };
          return { ...s, enabled: false };
        });
        addLog('Preset Applied: Lost in Deep Space.');
        break;
      case 'forest':
        presetSources = INITIAL_SOURCES.map(s => {
          if (s.id === 'forest') return { ...s, enabled: true, intensity: 0.85, x: -0.1, y: -0.2 };
          if (s.id === 'rain') return { ...s, enabled: true, intensity: 0.3, x: -0.7, y: 0.6 };
          return { ...s, enabled: false };
        });
        addLog('Preset Applied: Solitary Forest Temple.');
        break;
      default:
        presetSources = [...INITIAL_SOURCES];
        addLog('Preset Applied: Standard Sandbox Init.');
    }

    setSources(presetSources);

    // If already playing, hot-reload all sound nodes according to new configuration
    if (isPlaying && audioCtxRef.current && masterGainRef.current) {
      presetSources.forEach(s => {
        if (s.enabled) {
          initSourceNode(audioCtxRef.current!, masterGainRef.current!, s);
        } else {
          clearSourceNodes(s.id);
        }
      });
    }
  };

  // Master Audio Volume Modifiers
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtxRef.current.currentTime);
    }
  }, [masterVolume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      Object.keys(nodesRef.current).forEach(id => {
        if (nodesRef.current[id]?.intervalId) clearInterval(nodesRef.current[id].intervalId);
      });
    };
  }, []);

  // Smart heuristic prompt engine that acts as the "AI Sound Designer"
  const handleAiDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiStatus('Parsing prompt instructions...');
    addLog(`AI: Analyzing prompt: "${aiPrompt}"`);

    setTimeout(() => {
      const promptLower = aiPrompt.toLowerCase();
      const updatedSources = sources.map(s => {
        let enabled = s.enabled;
        let intensity = s.intensity;
        let x = s.x;
        let y = s.y;

        // Keyword parsing rules
        if (promptLower.includes('rain') || promptLower.includes('storm') || promptLower.includes('cyberpunk') || promptLower.includes('wet')) {
          if (s.id === 'rain') {
            enabled = true;
            intensity = promptLower.includes('heavy') || promptLower.includes('hard') ? 0.95 : 0.65;
            x = -0.15;
            y = 0.2;
          }
        }
        
        if (promptLower.includes('space') || promptLower.includes('deep') || promptLower.includes('drone') || promptLower.includes('cosmic') || promptLower.includes('melancholic')) {
          if (s.id === 'space') {
            enabled = true;
            intensity = promptLower.includes('quiet') || promptLower.includes('distant') ? 0.3 : 0.85;
            x = 0.1;
            y = -0.2;
          }
        }

        if (promptLower.includes('forest') || promptLower.includes('nature') || promptLower.includes('birds') || promptLower.includes('calm') || promptLower.includes('morning')) {
          if (s.id === 'forest') {
            enabled = true;
            intensity = 0.8;
            x = -0.3;
            y = -0.4;
          }
        }

        if (promptLower.includes('keyboard') || promptLower.includes('typing') || promptLower.includes('writing') || promptLower.includes('chimes') || promptLower.includes('focus')) {
          if (s.id === 'keyboard') {
            enabled = true;
            intensity = promptLower.includes('intense') ? 0.9 : 0.65;
            x = 0.25;
            y = 0.45;
          }
        }

        if (promptLower.includes('wind') || promptLower.includes('solar') || promptLower.includes('breeze') || promptLower.includes('cold') || promptLower.includes('empty')) {
          if (s.id === 'wind') {
            enabled = true;
            intensity = 0.75;
            x = 0.0;
            y = -0.6;
          }
        }

        // Handle structural descriptors
        if (promptLower.includes('isolated') || promptLower.includes('wide') || promptLower.includes('spacious')) {
          // Push components to the edges of the spatial panning canvas
          if (x !== 0) x = x > 0 ? 0.8 : -0.8;
          if (y !== 0) y = y > 0 ? 0.8 : -0.8;
        }

        if (promptLower.includes('intimate') || promptLower.includes('cozy') || promptLower.includes('near')) {
          // Pull close to the listener center
          x = x * 0.4;
          y = y * 0.4;
        }

        if (promptLower.includes('mute all') || promptLower.includes('silence')) {
          enabled = false;
        }

        return { ...s, enabled, intensity, x, y };
      });

      // Assemble procedural response explanation
      const changes: string[] = [];
      updatedSources.forEach((s, idx) => {
        const old = sources[idx];
        if (s.enabled !== old.enabled) {
          changes.push(`${s.name} toggled ${s.enabled ? 'ON' : 'OFF'}`);
        } else if (s.enabled && (s.intensity !== old.intensity || s.x !== old.x)) {
          changes.push(`Adjusted ${s.name} (Intensity: ${Math.round(s.intensity*100)}%, Pan: ${Math.round(s.x*100)})`);
        }
      });

      setSources(updatedSources);

      // Hot reload synthesis parameters instantly
      if (isPlaying && audioCtxRef.current && masterGainRef.current) {
        updatedSources.forEach(s => {
          if (s.enabled) {
            initSourceNode(audioCtxRef.current!, masterGainRef.current!, s);
          } else {
            clearSourceNodes(s.id);
          }
        });
      }

      setAiStatus('Parameters mapped successfully.');
      addLog(`AI: Spatial synthesis parameters updated successfully.`);
      changes.forEach(change => addLog(`AI Design -> ${change}`));
      setIsAiLoading(false);
      setAiPrompt('');
    }, 1200);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#050508] text-[#f8f9fa] flex flex-col overflow-hidden font-sans">
      
      {/* Header Panel */}
      <header className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.7)] backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-color)] flex items-center justify-center shadow-[0_0_12px_var(--accent-glow)]">
            <Music size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Soundscape AI
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.6)]">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-mono">Procedural Ambient Sandbox & Synthesizer</p>
          </div>
        </div>

        {/* Play controls in Header */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <button
              onClick={stopAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff453a] hover:bg-[#ff3b30] text-white font-medium text-xs tracking-wider uppercase transition-colors shadow-[0_0_12px_rgba(255,69,58,0.2)]"
            >
              <Square size={13} fill="currentColor" /> Stop Engine
            </button>
          ) : (
            <button
              onClick={startAudio}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[#b04ce0] text-black font-semibold text-xs tracking-wider uppercase transition-colors shadow-[0_0_15px_var(--accent-glow)]"
            >
              <Play size={13} fill="currentColor" /> Init Synthesizer
            </button>
          )}
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Sidebar: Generative Ambient Nodes (4 cols) */}
        <section className="lg:col-span-4 border-r border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,15,0.3)] p-5 overflow-y-auto flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.04)] pb-3">
            <h2 className="text-xs font-mono uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-[var(--accent-color)]" /> Ambient Generators
            </h2>
            <button 
              onClick={() => applyPreset('reset')}
              className="text-[10px] text-[var(--text-secondary)] hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <RefreshCw size={10} /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {sources.map((src) => (
              <div 
                key={src.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  src.enabled 
                    ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'bg-transparent border-[rgba(255,255,255,0.03)] opacity-50 hover:opacity-75'
                }`}
              >
                {/* Node Toggle Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" 
                      style={{ 
                        backgroundColor: src.color,
                        boxShadow: src.enabled ? `0 0 8px ${src.color}` : 'none'
                      }} 
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{src.name}</h3>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{src.description}</p>
                    </div>
                  </div>
                  
                  {/* Enable Switch */}
                  <button
                    onClick={() => handleUpdateSource(src.id, { enabled: !src.enabled })}
                    className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${
                      src.enabled ? 'bg-[var(--accent-color)]' : 'bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        src.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} 
                    />
                  </button>
                </div>

                {/* Intensity Slider (only when active) */}
                {src.enabled && (
                  <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.03)] flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] w-14 shrink-0">
                      Intensity:
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={src.intensity}
                      onChange={(e) => handleUpdateSource(src.id, { intensity: parseFloat(e.target.value) })}
                      className="flex-1 accent-[var(--accent-color)]"
                    />
                    <span className="text-[10px] font-mono text-white w-6 text-right">
                      {Math.round(src.intensity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Presets Selection */}
          <div className="bg-[rgba(15,15,25,0.4)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5">
            <h4 className="text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-2.5 flex items-center gap-1.5">
              <Compass size={12} className="text-[var(--accent-color)]" /> Studio Scenarios
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => applyPreset('cyberpunk')}
                className="px-2 py-1.5 rounded bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-[10px] font-mono text-center transition-colors"
              >
                Cyber Alley
              </button>
              <button
                onClick={() => applyPreset('deepspace')}
                className="px-2 py-1.5 rounded bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-[10px] font-mono text-center transition-colors"
              >
                Deep Space
              </button>
              <button
                onClick={() => applyPreset('forest')}
                className="px-2 py-1.5 rounded bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-[10px] font-mono text-center transition-colors"
              >
                Forest Zen
              </button>
            </div>
          </div>
        </section>

        {/* Center: Spatial Mixer Canvas (5 cols) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-center p-6 border-r border-[rgba(255,255,255,0.05)] bg-[rgba(5,5,8,0.2)]">
          <div className="w-full flex items-center justify-between mb-4 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-[var(--accent-color)]" /> Spatial Coordinates
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#30d158] animate-pulse shadow-[0_0_8px_#30d158]' : 'bg-[#606070]'}`} />
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                {isPlaying ? 'ACTIVE SYNTHESIS' : 'ENGINE SUSPENDED'}
              </span>
            </div>
          </div>

          <SoundCanvas sources={sources} onUpdateSource={handleUpdateSource} />
        </section>

        {/* Right Panel: Frequency Visualizer & AI Sound Designer (3 cols) */}
        <section className="lg:col-span-3 flex flex-col overflow-hidden bg-[rgba(10,10,15,0.4)]">
          
          {/* Top Half: Real-time Frequency Visualizer */}
          <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex flex-col gap-3 h-1/2 shrink-0">
            <h3 className="text-xs font-mono uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-[var(--accent-color)]" /> Frequency Spectrum
            </h3>
            
            <div className="flex-1 min-h-[140px] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden relative bg-[#050508]">
              {!isPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[rgba(5,5,8,0.85)] z-10 text-center">
                  <Play size={24} className="text-[rgba(255,255,255,0.3)] mb-2 animate-bounce" />
                  <p className="text-xs font-mono text-[var(--text-secondary)]">Click "Init Synthesizer" above to unlock audio frequencies.</p>
                </div>
              )}
              <canvas 
                ref={visualizerCanvasRef} 
                className="w-full h-full block"
                width={300}
                height={180}
              />
            </div>
          </div>

          {/* Bottom Half: AI Sound Designer */}
          <div className="p-5 flex-1 flex flex-col gap-3 min-h-[250px] overflow-hidden">
            <h3 className="text-xs font-mono uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--accent-color)]" /> AI Sound Designer
            </h3>

            {/* Prompt Form */}
            <form onSubmit={handleAiDesign} className="flex flex-col gap-2 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. heavy storm with deep drone..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] focus:border-[var(--accent-color)] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[rgba(255,255,255,0.3)] outline-none font-sans transition-all duration-200 pr-10"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="absolute right-1 top-1 bottom-1 px-3.5 rounded bg-[var(--accent-color)] hover:bg-[#b04ce0] disabled:bg-[rgba(255,255,255,0.05)] text-black font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  {isAiLoading ? '...' : <Sparkles size={13} />}
                </button>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setAiPrompt('isolated cyber storm')}
                  className="text-[9px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] font-mono transition-all"
                >
                  + Cyber Storm
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('cozy space cabin writing')}
                  className="text-[9px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] font-mono transition-all"
                >
                  + Space Cabin
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('calm sunny birds forest')}
                  className="text-[9px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] font-mono transition-all"
                >
                  + Sunny Forest
                </button>
              </div>
            </form>

            {/* Smart Heuristic Console Output */}
            <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,8,0.7)] p-3 overflow-hidden flex flex-col font-mono text-[10px]">
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.04)] pb-2 mb-2 shrink-0">
                <Terminal size={11} className="text-[var(--accent-color)]" />
                <span className="text-[rgba(255,255,255,0.6)]">CONSOLE LOGS: {aiStatus}</span>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1.5 scrollbar-thin">
                {aiLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('AI Design ->') ? 'text-[var(--accent-color)]' : log.includes('AI:') ? 'text-[#00f0ff]' : 'text-[var(--text-secondary)]'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Master Audio Controller Footer */}
      <footer className="px-6 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.9)] backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-white flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX size={15} className="text-[#ff453a]" /> : <Volume2 size={15} />}
          </button>
          
          <div className="flex items-center gap-2.5 w-32 sm:w-48">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] shrink-0">
              Master:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className="w-full accent-[var(--accent-color)] cursor-pointer"
            />
            <span className="text-[10px] font-mono text-white w-8 text-right">
              {isMuted ? 'MUTE' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--text-secondary)] font-mono hidden md:block">
          Outlets: Stereo · Synthesizer Core: v1.0.4 · Buffers: 44.1kHz
        </p>

        <div className="text-[10px] text-[var(--text-secondary)] font-mono">
          Designed by Antigravity Core
        </div>
      </footer>

    </div>
  );
}
