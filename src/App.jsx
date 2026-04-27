import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, User, Mic, Volume2, VolumeX, Sparkles,
  Menu, Plus, Layout, Settings, History, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { getGroqResponse, getCommandIntent } from './services/groq';

const initialMessages = [
  {
    id: 1,
    text: "Neural link established. FRIDAY at your service. How can I assist you today, sir?",
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

function AIOrb({ isThinking, isListening }) {
  return (
    <div className="flex flex-col items-center justify-center mb-6 pt-4">
      <div className={`w-20 h-20 rounded-full relative flex items-center justify-center border transition-all duration-500 ${isListening ? 'border-cyan-400 scale-110 bg-cyan-500/10 shadow-[0_0_60px_rgba(6,182,212,0.6)]' :
          isThinking ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)]' :
            'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
        } bg-black/40`}>
        <Bot size={28} className={`z-10 transition-colors ${isListening ? 'text-white' : 'text-cyan-400'}`} />
        <motion.div
          animate={{
            scale: isListening ? [1, 1.2, 1] : isThinking ? [1, 1.1, 1] : [1, 1.05, 1],
            rotate: 360
          }}
          transition={{ repeat: Infinity, duration: isListening ? 0.8 : isThinking ? 1.5 : 4, ease: "linear" }}
          className={`absolute inset-0 rounded-full border-2 ${isListening ? 'border-cyan-400' : 'border-cyan-500/20'} border-t-cyan-400`}
        />
        {isListening && (
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full bg-cyan-500/30"
          />
        )}
      </div>
      {(isThinking || isListening) && (
        <span className="mt-6 text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400/70 animate-pulse">
          {isListening ? "Listening..." : "Processing..."}
        </span>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }) { // eslint-disable-line no-unused-vars
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'
        }`}
    >
      <Icon size={16} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function App() {
  const [isMicEnabled, setIsMicEnabled] = useState(true);
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
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('friday_memories');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const speakText = (text) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha'));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };



  const detectCommandLocal = (text) => {
    const t = text.toLowerCase().trim();

    // Action verbs
    const openVerbs = /^(open|go to|launch|start)\s+/;
    const searchVerbs = /^(search|find|google|lookup)\s+(?:for\s+)?/;

    // 1. YouTube Search: "youtube react tutorial", "search youtube for react"
    if (t.includes('youtube') && !t.match(/^(open|go to|launch|start)\s+youtube$/)) {
      // Remove keywords to isolate the query
      let query = t.replace(/search|find|for|on|in|youtube|go to/g, '').trim();
      if (query) return { action: "youtube_search", query };
    }

    // 2. GitHub Search: "search github for friday", "find friday repo"
    if (t.includes('github') && (searchVerbs.test(t) || t.includes('repo'))) {
      let query = t.replace(/search|find|for|on|in|github|repo/g, '').trim();
      if (query) return { action: "github_search", query };
    }

    // 3. Open Sites: "open github", "go to youtube"
    if (openVerbs.test(t)) {
      if (t.includes('github')) return { action: "open_site" };
      // If automation.js supported opening youtube directly, we'd add it here
    }

    // 4. Google Search: "search react hooks", "google react hooks"
    if (searchVerbs.test(t) || t.startsWith('google ')) {
      let query = t.replace(searchVerbs, '').replace(/^google\s+/, '').trim();
      if (query && !query.includes('youtube') && !query.includes('github')) {
        return { action: "search_google", query };
      }
    }

    // No local pattern matched
    return null;
  };

  const handleSingleCommand = async (intent, cmdText, contextMessages) => {
    if (!intent || intent.action === "chat") {
      // 4. FALLBACK - send to AI
      return await getGroqResponse([...contextMessages, { text: cmdText, sender: 'user' }], memories);
    }

    const { action, query } = intent;

    // 1. OPEN SITE
    if (action === "open_site") {
      const lowText = cmdText.toLowerCase();
      if (lowText.includes('github')) {
        window.open('https://github.com', '_blank');
        return "Opening GitHub...";
      } else if (lowText.includes('youtube')) {
        window.open('https://www.youtube.com', '_blank');
        return "Opening YouTube...";
      } else {
        // default to google
        window.open('https://www.google.com', '_blank');
        return "Opening Google...";
      }
    }

    // 2. GOOGLE SEARCH
    if (action === "search_google") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `Searching Google for "${query}"...`;
    }

    // 3. YOUTUBE SEARCH
    if (action === "youtube_search") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
      return `Searching YouTube for "${query}"...`;
    }

    if (action === "github_search") {
      window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `Searching GitHub for "${query}"...`;
    }

    // Fallback if action is unhandled
    return await getGroqResponse([...contextMessages, { text: cmdText, sender: 'user' }], memories);
  };

  const executeCommands = async (commandsArray, contextMessages) => {
    setIsTyping(false);

    for (let i = 0; i < commandsArray.length; i++) {
      const cmd = commandsArray[i];

      // Try local flexible pattern matching first, fallback to AI intent parsing
      let intent = detectCommandLocal(cmd);
      if (!intent) {
        intent = await getCommandIntent(cmd);
      }

      const isCmd = intent && intent.action && intent.action !== "chat";

      // Simulate thinking delay before each action
      setIsExecutingTask(isCmd);
      setIsTyping(!isCmd);
      await new Promise(resolve => setTimeout(resolve, 800));

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
        // Also update contextMessages implicitly if needed, though for sequential commands 
        // we might just append it. For now, pushing to state is enough for UI.
        return [...prev, newMsg];
      });
      speakText(responseText);

      // Smooth scroll
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // Small delay between actions for realism
      if (i < commandsArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    setIsExecutingTask(false);
    setIsTyping(false);
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
    if (!text) return;

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

    // Split user input by "and", "then", or ","
    const commandsArray = text.split(/\s+and\s+|\s+then\s+|,/i).map(c => c.trim()).filter(Boolean);

    try {
      await executeCommands(commandsArray, [...messages, newUserMessage]);
    } catch (err) {
      console.error(err);
      setIsExecutingTask(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    processCommand(inputValue);
  };

  const startContinuousListening = () => {
    if (!isMicEnabled) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const rec = new Recognition();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => setIsRecording(true);

    rec.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript.toLowerCase();
        }
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
        // Activation feedback
        if (!isListening) {
          setIsListening(true);
          playActivationSound();
        }

        const parts = finalTranscript.split(foundWakeWord);
        const command = parts[parts.length - 1].trim();

        if (command) {
          processCommand(command);
          setIsListening(false);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setIsMicEnabled(false);
        setIsRecording(false);
        setIsListening(false);
      }
      console.error('Voice recognition error:', e.error);
    };

    rec.onend = () => {
      setIsRecording(false);
      setIsListening(false);
      // Automatically restart to always listen in background only if still enabled
      if (isMicEnabled) {
        setTimeout(() => {
          if (isMicEnabled) {
            try {
              startContinuousListening();
            } catch (err) {
              console.error("Failed to restart continuous listening:", err);
            }
          }
        }, 1000);
      }
    };

    try {
      rec.start();
    } catch (err) {
      console.error("Could not start recognition:", err);
    }
  };

  useEffect(() => {
    if (isMicEnabled) {
      startContinuousListening();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent the end handler from triggering a restart
        recognitionRef.current.stop();
      }
    }
  }, [isMicEnabled]);

  return (
    <div className="h-screen w-screen bg-[#050505] flex overflow-hidden font-sans text-[#ececf1] selection:bg-cyan-500/20">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-black/40 border-r border-white/5 flex flex-col z-50 overflow-hidden flex-shrink-0 backdrop-blur-xl"
          >
            <div className="p-4 flex flex-col h-full">
              <button
                onClick={() => {
                  setMessages(initialMessages);
                  localStorage.removeItem('friday_chat_history');
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-all"
              >
                <Plus size={16} />
                <span>New Transmission</span>
              </button>

              <div className="mt-8 flex-1 overflow-y-auto space-y-1">
                <div className="px-3 text-[10px] font-mono tracking-widest text-white/20 uppercase mb-4">Neural Logs</div>
                {/* <SidebarItem icon={History} label="Quantum Research" /> */}
                <SidebarItem icon={History} label="Interface Redesign" active />
              </div>

              <div className="pt-4 border-t border-white/5 space-y-1">
                <SidebarItem icon={Layout} label="Modules" />
                <SidebarItem icon={Settings} label="Diagnostics" />
                <SidebarItem icon={ExternalLink} label="Neural Docs" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#0d0d0d] to-black">
        <header className="h-14 flex items-center justify-between px-4 z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-all"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-70">Friday v4.2</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isVoiceEnabled) window.speechSynthesis.cancel();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-2 hover:bg-white/5 rounded-md transition-all ${isVoiceEnabled ? 'text-cyan-400' : 'text-white/20'}`}
            >
              {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scroll flex flex-col">
          <div className="max-w-3xl mx-auto w-full pt-12">
            <AIOrb isThinking={isTyping} isListening={isListening} />
          </div>

          <div className="flex-1">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full py-8 transition-all duration-500 ${msg.sender === 'ai'
                  ? msg.isCommand
                    ? 'bg-cyan-900/10 shadow-[inset_0_0_30px_rgba(34,211,238,0.05)] border-y border-cyan-500/20'
                    : 'bg-transparent'
                  : 'bg-white/[0.02]'
                }`}>
                <div className="max-w-3xl mx-auto flex w-full px-4 md:px-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-4 flex-shrink-0 ${msg.sender === 'ai'
                      ? msg.isCommand
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                        : 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-white/10 text-white'
                    }`}>
                    {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                        {msg.sender === 'ai' ? 'System' : 'User'}
                      </span>
                      <span className="text-[10px] opacity-20 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && !isExecutingTask && (
              <div className="max-w-3xl mx-auto flex w-full px-4 py-8">
                <div className="w-8 h-8 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center mr-4">
                  <Bot size={18} />
                </div>
                <div className="flex space-x-1 items-center h-8">
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </div>
              </div>
            )}
            {isExecutingTask && (
              <div className="max-w-3xl mx-auto flex w-full px-4 py-8">
                <div className="w-8 h-8 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center mr-4">
                  <Bot size={18} />
                </div>
                <div className="flex space-x-3 items-center h-8">
                  <span className="text-cyan-400 text-sm tracking-widest uppercase animate-pulse">Executing task...</span>
                  <div className="flex space-x-1 items-center">
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        </div>

        <div className="p-4 md:pb-12 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-xl focus-within:bg-white/[0.06] focus-within:border-cyan-500/50 transition-all"
            >
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
                className={`p-4 transition-all ${isMicEnabled ? (isRecording ? 'text-cyan-400 animate-pulse' : 'text-cyan-600') : 'text-white/20 hover:text-white/40'}`}
              >
                <Mic size={20} />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message FRIDAY..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/20 py-4 font-sans text-[15px]"
              />

              <div className="pr-2 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/20'
                    }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
