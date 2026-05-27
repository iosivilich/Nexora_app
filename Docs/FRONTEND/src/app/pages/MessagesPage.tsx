'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '../components/GlassCard';
import {
  ensureConversation,
  fetchConversations,
  fetchMessageThread,
  sendMessage,
} from '../../lib/api';
import type { ConversationPreview, ConversationThread } from '../../lib/backend-types';

const emptyThread: ConversationThread = {
  conversationId: '',
  items: [],
  source: 'supabase',
  persistent: true,
};

export function MessagesPage() {
  const searchParams = useSearchParams();
  const consultantId = searchParams.get('consultantId');
  const conversationIdFromUrl = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationThread>(emptyThread);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mobile/tablet: toggle between list and chat panel
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');

  const loadConversations = async (preferredConversationId?: string | null) => {
    const response = await fetchConversations();
    setConversations(response.items);
    const nextSelected = preferredConversationId ?? response.items[0]?.id ?? null;
    setSelectedConversationId(nextSelected);
    return nextSelected;
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        let preferredConversationId = conversationIdFromUrl;

        if (consultantId) {
          const conversation = await ensureConversation(consultantId);
          preferredConversationId = conversation.id;
        }

        const nextSelected = await loadConversations(preferredConversationId);

        if (preferredConversationId) {
          setMobilePanel('chat');
        }

        if (active && nextSelected) {
          setThreadLoading(true);
          const nextThread = await fetchMessageThread(nextSelected);
          if (active) setThread(nextThread);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar las conversaciones.');
        }
      } finally {
        if (active) {
          setLoading(false);
          setThreadLoading(false);
        }
      }
    })();

    return () => { active = false; };
  }, [consultantId, conversationIdFromUrl]);

  useEffect(() => {
    if (!selectedConversationId || selectedConversationId === thread.conversationId) return;

    let active = true;
    setThreadLoading(true);

    fetchMessageThread(selectedConversationId)
      .then((nextThread) => { if (active) setThread(nextThread); })
      .catch((fetchError) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar el hilo.');
      })
      .finally(() => { if (active) setThreadLoading(false); });

    return () => { active = false; };
  }, [selectedConversationId, thread.conversationId]);

  const filteredConversations = useMemo(
    () => conversations.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [conversations, searchTerm],
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) ?? null;

  function selectConversation(id: string) {
    setSelectedConversationId(id);
    setMobilePanel('chat');
  }

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) return;
    setSending(true);
    try {
      const nextThread = await sendMessage(selectedConversationId, messageText);
      setThread(nextThread);
      setMessageText('');
      await loadConversations(selectedConversationId);
    } catch (sendError) {
      toast.error(sendError instanceof Error ? sendError.message : 'No pudimos enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  // ─── Sub-panels ─────────────────────────────────────────────────────────────

  const ConversationList = (
    <GlassCard className="h-full flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border-b border-white/5">
                <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              </div>
            ))
          : filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full p-3 sm:p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                  selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                }`}
              >
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-medium truncate">{conv.name}</span>
                    <span className="text-[11px] text-white/50 flex-shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{conv.role}</p>
                  <p className="text-xs text-white/60 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </button>
            ))}

        {!loading && filteredConversations.length === 0 && (
          <p className="p-6 text-sm text-white/50 text-center">
            Todavía no tienes conversaciones activas.
          </p>
        )}
      </div>
    </GlassCard>
  );

  const ChatPanel = (
    <GlassCard className="h-full flex flex-col overflow-hidden">
      {selectedConversation ? (
        <>
          {/* Chat header */}
          <div className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
            {/* Back button on mobile/tablet */}
            <button
              onClick={() => setMobilePanel('list')}
              className="lg:hidden p-1.5 -ml-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Volver a conversaciones"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <img
              src={selectedConversation.avatar}
              alt={selectedConversation.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-semibold truncate">{selectedConversation.name}</h3>
              <p className="text-xs text-white/50 truncate">{selectedConversation.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
            {threadLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : thread.items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-white/40">
                Aún no hay mensajes. ¡Sé el primero en escribir!
              </div>
            ) : (
              thread.items.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2.5 rounded-2xl ${
                      msg.isOwn
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className="text-[10px] mt-1.5 opacity-60 text-right">{msg.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="Escribe tu mensaje…"
                className="flex-1 px-3 sm:px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                onClick={() => void handleSendMessage()}
                disabled={sending || !messageText.trim()}
                className="px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-white/40 p-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <p className="text-sm text-center">Selecciona una conversación para comenzar.</p>
        </div>
      )}
    </GlassCard>
  );

  // ─── Page ────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-[calc(100dvh-144px)] lg:h-auto lg:max-w-7xl lg:mx-auto px-3 sm:px-6 lg:px-8 lg:py-8"
    >
      {/* Header — compact on mobile, full on desktop */}
      <div className="py-3 lg:pb-6 lg:pt-0 flex-shrink-0">
        <h1
          className="text-2xl sm:text-3xl lg:text-5xl text-white"
          style={{ fontFamily: 'var(--font-secondary)' }}
        >
          Mensajes
        </h1>
        <p className="hidden lg:block text-base text-white/60 mt-1">
          Conversaciones reales persistidas en Supabase
        </p>
      </div>

      {error && (
        <div className="mb-3 px-4 py-3 rounded-xl border border-red-400/20 bg-red-500/10 text-sm text-red-300 flex-shrink-0">
          {error}
        </div>
      )}

      {/* ── Mobile (< lg): single panel at a time ─────────────────────────── */}
      <div className="flex-1 min-h-0 lg:hidden">
        {mobilePanel === 'list' ? ConversationList : ChatPanel}
      </div>

      {/* ── Desktop (lg+): side-by-side ──────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        <div className="lg:col-span-4 min-h-0">{ConversationList}</div>
        <div className="lg:col-span-8 min-h-0">{ChatPanel}</div>
      </div>
    </motion.div>
  );
}
