import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, User, Mic, Volume2, VolumeX, Sparkles,
  Menu, Plus, Layout, Settings, History, ExternalLink,
  Activity, Shield, Cpu, Database, Zap, Terminal, Search
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getGroqResponse, getCommandIntent } from './services/groq';
import './App.css';

const initialMessages = [
  {
    id: 1,
    text: "Neural link established. FRIDAY at your service. How can I assist you today, sir?",
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

function ParticleBackground() {
  const particles = React.useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{ left: p.left, top: p.top, animationDelay: p.delay }}
        />
      ))}
    </div>
  );
}

function MatrixRain() {
  const columns = React.useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      chars: Array.from({ length: 30 }, () => Math.floor(Math.random() * 120))
    })), []);

  const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute text-cyan-400 font-mono text-xs leading-none"
          style={{
            left: `${col.id * 5}%`,
            animation: `matrix-fall ${col.duration}s linear infinite`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars.map((charIdx, i) => (
            <div key={i} className="opacity-60">
              {characters[charIdx % characters.length]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TypewriterText({ text, speed = 50 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) return;
    
    setDisplayedText('');
    setIsTyping(true);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
}
function AIOrb({ isThinking, isListening }) {
  return (
    <div className="flex flex-col items-center justify-center mb-6 pt-4">
      <div className={`w-24 h-24 rounded-full relative flex items-center justify-center border-2 transition-all duration-700 glow-cyan ${isListening ? 'border-cyan-400 scale-110 bg-cyan-500/10 shadow-[0_0_80px_rgba(6,182,212,0.6)]' :
          isThinking ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.4)]' :
            'border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
        } bg-black/60 backdrop-blur-md`}>
        
        {/* Core Orb */}
        <div className="absolute inset-2 rounded-full border border-cyan-500/20 flex items-center justify-center overflow-hidden">
          <Motion.div 
            animate={{ 
              rotate: 360,
              scale: isListening ? [1, 1.2, 1] : 1
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(6,182,212,0.8)_0%,transparent_70%)]"
          />
          <Bot size={32} className={`z-10 transition-all duration-500 ${isListening ? 'text-white scale-110' : 'text-cyan-400'}`} />
        </div>

        {/* Enhanced Outer Rings */}
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400/60 border-b-cyan-400/20 shimmer`}
        />
        <Motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className={`absolute -inset-2 rounded-full border border-transparent border-l-cyan-500/30 border-r-cyan-500/10`}
        />
        <Motion.div
          animate={{ rotate: 180 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className={`absolute -inset-4 rounded-full border border-transparent border-t-cyan-400/20 border-b-cyan-400/10`}
        />
        
        {isListening && (
          <>
            <Motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-cyan-500/30"
            />
            <div className="absolute -bottom-8 flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          </>
        )}
      </div>
      {(isThinking || isListening) && (
        <span className="mt-10 text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400 animate-pulse">
          {isListening ? "Listening..." : "Processing..."}
        </span>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm group ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white/70'
        }`}
    >
      <Icon size={16} className={`transition-colors ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
      <span className="truncate font-medium">{label}</span>
      {active && (
        <Motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]"
        />
      )}
    </button>
  );
}

function DiagnosticsView() {
  const stats = [
    { label: "Neural Synapse", value: "98.4%", color: "text-cyan-400" },
    { label: "Quantum Coherence", value: "Stable", color: "text-emerald-400" },
    { label: "Memory Integrity", value: "99.9%", color: "text-cyan-400" },
    { label: "Response Latency", value: "12ms", color: "text-cyan-400" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tighter uppercase text-cyan-400 flex items-center gap-3">
          <Activity className="text-cyan-500" /> System Diagnostics
        </h2>
        <div className="text-[10px] font-mono text-cyan-500/40 px-3 py-1 border border-cyan-500/20 rounded">
          ENCRYPTED LINK :: FRIDAY_V4.2
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="hud-border bg-white/[0.02] p-4 rounded-lg backdrop-blur-sm"
          >
            <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">{stat.label}</div>
            <div className={`text-xl font-mono ${stat.color}`}>{stat.value}</div>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 hud-border bg-white/[0.02] p-6 rounded-lg">
          <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" /> Core Processing
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-white/40">
                  <span>Thread #{i * 12}</span>
                  <span>{40 + i * 15}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <Motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${40 + i * 15}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hud-border bg-white/[0.02] p-6 rounded-lg flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-4">
             <Motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20"
             />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Shield size={32} className="text-cyan-400 mb-1" />
                <span className="text-[10px] font-mono text-cyan-400">SECURE</span>
             </div>
          </div>
          <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest">
            Neural Firewall Active<br/>v2.4.9-Stable
          </p>
        </div>
      </div>
    </div>
  );
}

function ModulesView() {
  const modules = [
    { icon: Cpu, name: "Quantum Logic", desc: "Advanced reasoning and problem solving capabilities." },
    { icon: Database, name: "Neural Memory", desc: "Long-term data persistence and contextual recall." },
    { icon: Terminal, name: "Code Synthesis", desc: "Direct interface for software development and debugging." },
    { icon: Zap, name: "Stream Processing", desc: "Real-time analysis of multi-modal data streams." },
    { icon: Shield, name: "Cyber Defense", label: "ACTIVE", desc: "Automated threat detection and neutralization." },
    { icon: Sparkles, name: "Creative Engine", desc: "Generative capabilities for design and content." },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tighter uppercase text-cyan-400 flex items-center gap-3 holographic-text">
        <Layout className="text-cyan-500" /> Active Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={mod.name}
            className="hud-border group bg-white/[0.02] hover:bg-white/[0.05] p-6 rounded-xl transition-all cursor-pointer border border-white/5 hover:border-cyan-500/30 hover:scale-105 hover:rotate-1 hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] transform-gpu"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <mod.icon size={24} />
              </div>
              {mod.label && (
                <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                  {mod.label}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{mod.name}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{mod.desc}</p>
          </Motion.div>
        ))}
      </div>
    </div>
  );
}

function DocsView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="hud-border bg-black/40 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">fr_documentation_v1.0.sh</span>
          <div />
        </div>
        <div className="p-8 font-mono text-sm space-y-6">
          <div className="text-cyan-400">$ cat neural_link_protocols.txt</div>
          <div className="text-white/60 leading-relaxed border-l-2 border-cyan-500/20 pl-4">
            <p className="mb-4"># FRIDAY Interface Documentation</p>
            <p className="mb-2">The Neural Link (NL) allows for seamless communication between the user and the FRIDAY core system. All communications are encrypted via quantum-state layering.</p>
            <ul className="list-disc list-inside space-y-1 mt-4">
              <li>Voice Activation: "Hey Friday" or "Friday"</li>
              <li>Multi-modal Input: Voice, Text, Vision</li>
              <li>Contextual Memory: 2TB local cache + cloud sync</li>
            </ul>
          </div>
          <div className="text-cyan-400">$ ./fetch_capabilities --all</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-emerald-400">[READY] NLP Core</div>
            <div className="text-emerald-400">[READY] Vision Subsystem</div>
            <div className="text-emerald-400">[READY] Code Compiler</div>
            <div className="text-emerald-400">[READY] Security Layer</div>
            <div className="text-yellow-400">[STAGING] Quantum Predictor</div>
            <div className="text-emerald-400">[READY] Audio Synthesis</div>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400 mt-8">
             <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'diagnostics', 'modules', 'docs'
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('friday_chat_history');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  useEffect(() => {
    localStorage.setItem('friday_chat_history', JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('friday_memories');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);
  const lastVoiceCommandRef = useRef('');
  const lastVoiceCommandTimeRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeView === 'chat') scrollToBottom();
  }, [messages, isTyping, activeView]);

  const speakText = (text) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Female'));
    
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const detectCommandLocal = (text) => {
    const t = text.toLowerCase().trim();
    const openVerbs = /^(open|go to|launch|start)\s+/;
    const searchVerbs = /^(search|find|google|lookup)\s+(?:for\s+)?/;

    if (t.includes('youtube') && !t.match(/^(open|go to|launch|start)\s+youtube$/)) {
      let query = t.replace(/search|find|for|on|in|youtube|go to/g, '').trim();
      if (query) return { action: "youtube_search", query };
    }
    if (t.includes('github') && (searchVerbs.test(t) || t.includes('repo'))) {
      let query = t.replace(/search|find|for|on|in|github|repo/g, '').trim();
      if (query) return { action: "github_search", query };
    }
    if (openVerbs.test(t)) {
      if (t.includes('github')) return { action: "open_site" };
    }
    if (searchVerbs.test(t) || t.startsWith('google ')) {
      let query = t.replace(searchVerbs, '').replace(/^google\s+/, '').trim();
      if (query && !query.includes('youtube') && !query.includes('github')) {
        return { action: "search_google", query };
      }
    }
    return null;
  };

  const handleSingleCommand = async (intent, cmdText, contextMessages) => {
    if (!intent || intent.action === "chat") {
      return await getGroqResponse([...contextMessages, { text: cmdText, sender: 'user' }], memories);
    }
    const { action, query } = intent;
    if (action === "open_site") {
      const lowText = cmdText.toLowerCase();
      if (lowText.includes('github')) {
        window.open('https://github.com', '_blank');
        return "Opening GitHub...";
      } else if (lowText.includes('youtube')) {
        window.open('https://www.youtube.com', '_blank');
        return "Opening YouTube...";
      } else {
        window.open('https://www.google.com', '_blank');
        return "Opening Google...";
      }
    }
    if (action === "search_google") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `Searching Google for "${query}"...`;
    }
    if (action === "youtube_search") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
      return `Searching YouTube for "${query}"...`;
    }
    if (action === "github_search") {
      window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `Searching GitHub for "${query}"...`;
    }
    return await getGroqResponse([...contextMessages, { text: cmdText, sender: 'user' }], memories);
  };

  const executeCommands = async (commandsArray, contextMessages) => {
    try {
      setIsTyping(false);
      for (let i = 0; i < commandsArray.length; i++) {
        const cmd = commandsArray[i];
        let intent = detectCommandLocal(cmd);
        if (!intent) intent = await getCommandIntent(cmd);
        const isCmd = intent && intent.action && intent.action !== "chat";
        
        setIsExecutingTask(isCmd);
        setIsTyping(!isCmd);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        let responseText = await handleSingleCommand(intent, cmd, contextMessages);
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => {
          const newMsg = {
            id: Date.now() + Math.random(),
            text: responseText,
            sender: 'ai',
            timestamp,
            isCommand: isCmd
          };
          return [...prev, newMsg];
        });
        
        speakText(responseText);
        
        if (i < commandsArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      setIsExecutingTask(false);
      setIsTyping(false);
    }
  };

  const playActivationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  };

  const processCommand = async (text) => {
    if (!text || isSpeaking || isProcessing) return;
    
    setIsProcessing(true);
    setIsListening(false);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage = { id: Date.now(), text, sender: 'user', timestamp };
    
    if (text.toLowerCase().includes("remember")) {
      const newMems = [...memories, text];
      setMemories(newMems);
      localStorage.setItem('friday_memories', JSON.stringify(newMems));
    }
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    
    const normalizedText = text.trim();
    const commandCandidates = normalizedText
      .split(/\b(?:and then|then|;)\b/i)
      .map(c => c.trim())
      .filter(Boolean);

    const commandsArray = commandCandidates.length > 1 ? commandCandidates : [normalizedText];

    try {
      await executeCommands(commandsArray, [...messages, newUserMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingTask(false);
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processCommand(inputValue);
    }
  };

  const startContinuousListening = () => {
    if (!isMicEnabled) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    
    const rec = new Recognition();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    
    rec.onstart = () => setIsRecording(true);
    
    rec.onresult = (e) => {
      // CRITICAL: Ignore any input while the AI is speaking to prevent infinite loops
      if (isSpeaking) return;

      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript.toLowerCase();
      }
      
      const wakeWords = ["hey friday", "ok friday", "friday"];
      let foundWakeWord = null;
      for (const word of wakeWords) {
        if (finalTranscript.includes(word)) {
          foundWakeWord = word;
          break;
        }
      }
      
      if (foundWakeWord) {
        if (!isListening) {
          setIsListening(true);
          playActivationSound();
        }
        
        const parts = finalTranscript.split(foundWakeWord);
        const command = parts[parts.length - 1].trim();
        const normalizedCommand = command.toLowerCase().trim();
        const now = Date.now();

        if (command) {
          if (normalizedCommand && normalizedCommand === lastVoiceCommandRef.current && now - lastVoiceCommandTimeRef.current < 3000) {
            return;
          }

          lastVoiceCommandRef.current = normalizedCommand;
          lastVoiceCommandTimeRef.current = now;

          processCommand(command);
          setIsListening(false);
        } else {
          // Reset listening if no command follows wake word after some time
          setTimeout(() => {
            if (isListening && !isTyping && !isExecutingTask) {
              setIsListening(false);
            }
          }, 3000);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setIsMicEnabled(false);
        setIsRecording(false);
        setIsListening(false);
      }
    };
    
    rec.onend = () => {
      setIsRecording(false);
      setIsListening(false);
      if (isMicEnabled) {
        setTimeout(() => {
          if (isMicEnabled) {
            try { startContinuousListening(); } catch { /* Ignore restart errors */ }
          }
        }, 1000);
      }
    };
    
    try { rec.start(); } catch { /* Ignore start errors */ }
  };

  useEffect(() => {
    if (isMicEnabled) startContinuousListening();
    else if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
  }, [isMicEnabled]);

  return (
    <div className="h-screen w-screen bg-[#050505] flex overflow-hidden font-sans text-[#ececf1] selection:bg-cyan-500/20 relative perspective-1000">
      
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
      <ParticleBackground />
      <MatrixRain />
      <div className="scanline" />

      <AnimatePresence>
        {sidebarOpen && (
          <Motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-black/60 border-r border-cyan-500/10 flex flex-col z-50 overflow-hidden flex-shrink-0 backdrop-blur-2xl glow-cyan"
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center space-x-3 px-3 py-4 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <Sparkles size={18} className="text-black" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tighter text-white">FRIDAY</span>
                    <span className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">Neural Link v4.2</span>
                 </div>
              </div>

              <button
                onClick={() => {
                  setMessages(initialMessages);
                  localStorage.removeItem('friday_chat_history');
                  setActiveView('chat');
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 border border-cyan-500/20 rounded-xl text-sm bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-cyan-400 font-medium group mb-8"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span>New Transmission</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scroll pr-2">
                <div className="px-3 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase mb-4">Core Systems</div>
                <SidebarItem 
                  icon={History} 
                  label="Neural Logs" 
                  active={activeView === 'chat'} 
                  onClick={() => setActiveView('chat')} 
                />
                <SidebarItem 
                  icon={Activity} 
                  label="Diagnostics" 
                  active={activeView === 'diagnostics'} 
                  onClick={() => setActiveView('diagnostics')} 
                />
                <SidebarItem 
                  icon={Layout} 
                  label="Modules" 
                  active={activeView === 'modules'} 
                  onClick={() => setActiveView('modules')} 
                />
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="px-3 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase mb-4">Resources</div>
                <SidebarItem 
                  icon={Terminal} 
                  label="Neural Docs" 
                  active={activeView === 'docs'} 
                  onClick={() => setActiveView('docs')} 
                />
                <SidebarItem icon={Settings} label="Interface Config" />
                <SidebarItem icon={ExternalLink} label="Cloud Sync" />
              </div>
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative h-full bg-transparent z-10">
        <header className="h-16 flex items-center justify-between px-6 z-40 bg-black/20 backdrop-blur-md border-b border-cyan-500/10 glow-cyan">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-cyan-500/10 rounded-lg text-white/40 hover:text-cyan-400 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">Link Stable</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 px-4 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">CPU LOAD</span>
                  <span className="text-xs font-mono text-cyan-400">14.2%</span>
               </div>
               <div className="w-px h-6 bg-white/10" />
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SYNC</span>
                  <span className="text-xs font-mono text-emerald-400">99.9%</span>
               </div>
            </div>

            <button
              onClick={() => {
                if (isVoiceEnabled) window.speechSynthesis.cancel();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-2 hover:bg-cyan-500/10 rounded-lg transition-all ${isVoiceEnabled ? 'text-cyan-400' : 'text-white/20'}`}
            >
              {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {activeView === 'chat' && (
              <Motion.div
                key="chat-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto custom-scroll flex flex-col h-full"
              >
                <div className="max-w-3xl mx-auto w-full pt-16">
                  <AIOrb isThinking={isTyping} isListening={isListening} />
                </div>

                <div className="flex-1 w-full max-w-4xl mx-auto px-4">
                  {messages.map((msg) => (
                    <Motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex w-full py-8 group transition-all duration-500 ${msg.sender === 'ai'
                        ? msg.isCommand
                          ? 'bg-cyan-500/5 shadow-[inset_0_0_30px_rgba(6,182,212,0.05)] border-y border-cyan-500/10 rounded-2xl my-4 glow-cyan'
                          : 'bg-transparent'
                        : 'bg-white/[0.01] rounded-2xl hover:bg-white/[0.02] transition-all'
                      }`}
                    >
                      <div className="max-w-3xl mx-auto flex w-full px-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-6 flex-shrink-0 transition-all ${msg.sender === 'ai'
                            ? msg.isCommand
                              ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110'
                            : 'bg-white/10 text-white'
                          }`}>
                          {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400/60">
                              {msg.sender === 'ai' ? 'Friday' : 'Command User'}
                            </span>
                            <span className="text-[10px] opacity-20 font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="text-[15px] leading-relaxed text-white/80 font-medium">{msg.text}</p>
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                  {isTyping && !isExecutingTask && (
                    <div className="max-w-3xl mx-auto flex w-full px-4 py-8">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mr-6 border border-cyan-500/20">
                        <Bot size={20} />
                      </div>
                      <div className="flex space-x-1.5 items-center h-10">
                        <Motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <Motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <Motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      </div>
                    </div>
                  )}
                  {isExecutingTask && (
                    <div className="max-w-3xl mx-auto flex w-full px-4 py-8">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-6 border border-cyan-500/30">
                        <Zap size={20} className="animate-pulse" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Executing Neural Command</span>
                        <div className="flex space-x-1 mt-1">
                           <Motion.div initial={{ width: 0 }} animate={{ width: "100px" }} transition={{ duration: 2, repeat: Infinity }} className="h-0.5 bg-cyan-500/40 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-40" />
                </div>
              </Motion.div>
            )}

            {activeView === 'diagnostics' && (
              <Motion.div
                key="diag-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex-1 overflow-y-auto custom-scroll"
              >
                <DiagnosticsView />
              </Motion.div>
            )}

            {activeView === 'modules' && (
              <Motion.div
                key="modules-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 overflow-y-auto custom-scroll"
              >
                <ModulesView />
              </Motion.div>
            )}

            {activeView === 'docs' && (
              <Motion.div
                key="docs-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto custom-scroll"
              >
                <DocsView />
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
        </div>

        {activeView === 'chat' && (
          <div className="px-6 pb-10 md:pb-14 z-30 relative">
            <div className="max-w-4xl mx-auto relative">
              
              {/* Voice Visualizer Mock */}
              {isListening && (
                <div className="absolute -top-12 left-0 right-0 flex justify-center space-x-1 h-8 items-center">
                  {[...Array(20)].map((_, i) => (
                    <Motion.div
                      key={i}
                      animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                      className="w-1 bg-cyan-500/40 rounded-full"
                    />
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center bg-white/[0.03] border border-white/5 rounded-2xl focus-within:bg-white/[0.06] focus-within:border-cyan-500/40 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all shadow-2xl backdrop-blur-xl group overflow-hidden glow-cyan"
              >
                {/* Glow effect on focus */}
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isMicEnabled;
                    setIsMicEnabled(nextVal);
                    if (!nextVal) {
                      setIsRecording(false);
                      setIsListening(false);
                    }
                  }}
                  className={`p-5 transition-all relative z-10 ${isMicEnabled ? (isRecording ? 'text-cyan-400' : 'text-cyan-600') : 'text-white/20 hover:text-white/40'}`}
                >
                  <Mic size={22} className={isRecording ? 'animate-pulse scale-110' : ''} />
                  {isRecording && <span className="absolute inset-4 rounded-full border border-cyan-500 animate-ping" />}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="System Input..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/20 py-5 font-sans text-[16px] relative z-10"
                />

                <div className="pr-3 flex items-center space-x-3 relative z-10">
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isProcessing}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${inputValue.trim() && !isProcessing ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95' : 'bg-white/5 text-white/20'
                      }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
              <div className="mt-4 flex justify-center space-x-6 text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
                 <span className="flex items-center gap-1.5"><Zap size={10} /> Neural Link Active</span>
                 <span className="flex items-center gap-1.5"><Shield size={10} /> Quantum Encryption</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
