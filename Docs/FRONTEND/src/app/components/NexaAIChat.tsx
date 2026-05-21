'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConsultantResult {
  nombre: string;
  rol: string;
  ciudad: string;
  rating: number;
  experiencia: number;
  proyectos: number;
  expertise: string[];
  verificado: boolean;
  bio: string | null;
}

interface CompanyResult {
  nombre: string;
  sector: string;
  tamaño: string | null;
  descripcion: string | null;
}

type NexaResult = ConsultantResult | CompanyResult;

function isConsultant(r: NexaResult): r is ConsultantResult {
  return 'rating' in r;
}

function ResultCard({ result }: { result: NexaResult }) {
  if (isConsultant(result)) {
    return (
      <div
        className="rounded-xl p-3 border border-white/10 space-y-1.5"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{result.nombre}</p>
            <p className="text-white/50 text-xs">{result.rol}</p>
          </div>
          {result.verificado && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              ✓ Verificado
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs">📍 {result.ciudad}</p>
        <p className="text-yellow-400 text-xs">
          ⭐ {result.rating.toFixed(1)} · {result.experiencia} años · {result.proyectos} proyectos
        </p>
        {result.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.expertise.map((e, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd' }}
              >
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3 border border-white/10 space-y-1.5"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-sm leading-tight">{result.nombre}</p>
          <p className="text-white/50 text-xs">{result.sector}</p>
        </div>
        {result.tamaño && (
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(109,94,243,0.2)', color: '#a89cf9' }}
          >
            {result.tamaño}
          </span>
        )}
      </div>
      {result.descripcion && (
        <p className="text-white/40 text-xs leading-relaxed">{result.descripcion}</p>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
        style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
      >
        ✦
      </div>
      <div
        className="rounded-xl rounded-bl-none px-3 py-2 flex gap-1 items-center"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

const WELCOME: Record<'EMPRESA' | 'CONSULTOR', string> = {
  EMPRESA:
    'Hola, soy Nexa AI. Cuéntame qué tipo de consultor necesitas y lo busco por ti.\n\nEj: "Necesito un consultor de data science con experiencia en fintech"',
  CONSULTOR:
    'Hola, soy Nexa AI. Cuéntame en qué tipo de empresa te gustaría ofrecer tus servicios y lo busco por ti.\n\nEj: "Busco empresas de tecnología o contabilidad en Bogotá"',
};

const PLACEHOLDER: Record<'EMPRESA' | 'CONSULTOR', string> = {
  EMPRESA: 'Describe el consultor que necesitas…',
  CONSULTOR: 'Describe la empresa que buscas…',
};

export function NexaAIChat() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<NexaResult[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userType: 'EMPRESA' | 'CONSULTOR' =
    profile?.userType === 'EMPRESA' ? 'EMPRESA' : 'CONSULTOR';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, results, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);
    setResults([]);

    try {
      const res = await fetch('/api/nexa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, userType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      setResults(data.results ?? []);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Hubo un error. Por favor intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, userType]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const reset = () => {
    setMessages([]);
    setResults([]);
    setInput('');
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white font-bold text-xl"
        style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Nexa AI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              className="text-base"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="spark"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
            >
              ✦
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-40 right-4 lg:bottom-24 lg:right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: 'min(calc(100vw - 32px), 400px)',
              maxHeight: '70vh',
              background: 'rgba(8,20,55,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(135deg,rgba(109,94,243,0.25),rgba(37,99,235,0.25))',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
                >
                  ✦
                </div>
                <div>
                  <p
                    className="text-white font-semibold text-sm"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    Nexa AI
                  </p>
                  <p className="text-white/40 text-xs">Recomendaciones inteligentes</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {/* Welcome */}
              <div className="flex gap-2 items-end">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white"
                  style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
                >
                  ✦
                </div>
                <div
                  className="rounded-xl rounded-bl-none px-3 py-2 text-sm text-white/80"
                  style={{ background: 'rgba(255,255,255,0.07)', whiteSpace: 'pre-line' }}
                >
                  {WELCOME[userType]}
                </div>
              </div>

              {/* Conversation */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white"
                      style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
                    >
                      ✦
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-3 py-2 text-sm max-w-[82%] ${
                      msg.role === 'user'
                        ? 'rounded-br-none text-white'
                        : 'rounded-bl-none text-white/80'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg,#6D5EF3,#2563EB)'
                          : 'rgba(255,255,255,0.07)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && <TypingIndicator />}

              {/* Result cards */}
              {results.length > 0 && (
                <div className="space-y-2 pt-1">
                  {results.map((r, i) => (
                    <ResultCard key={i} result={r} />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={PLACEHOLDER[userType]}
                  disabled={isLoading}
                  className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <button
                  onClick={() => void send()}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold disabled:opacity-30 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#6D5EF3,#2563EB)' }}
                >
                  ↑
                </button>
              </div>
              <p className="text-white/15 text-xs text-center mt-2">
                Nexa AI · Groq llama-3.1-8b-instant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
