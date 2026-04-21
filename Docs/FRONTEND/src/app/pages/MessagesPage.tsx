'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, MoreVertical } from 'lucide-react';
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

  const loadConversations = async (preferredConversationId?: string | null) => {
    const response = await fetchConversations();
    setConversations(response.items);

    const nextSelected =
      preferredConversationId ??
      response.items[0]?.id ??
      null;

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
        if (active && nextSelected) {
          setThreadLoading(true);
          const nextThread = await fetchMessageThread(nextSelected);
          if (active) {
            setThread(nextThread);
          }
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

    return () => {
      active = false;
    };
  }, [consultantId, conversationIdFromUrl]);

  useEffect(() => {
    if (!selectedConversationId || selectedConversationId === thread.conversationId) {
      return;
    }

    let active = true;
    setThreadLoading(true);

    fetchMessageThread(selectedConversationId)
      .then((nextThread) => {
        if (active) {
          setThread(nextThread);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar el hilo.');
        }
      })
      .finally(() => {
        if (active) {
          setThreadLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedConversationId, thread.conversationId]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [conversations, searchTerm],
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) {
      return;
    }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mensajes
          </h1>
          <p className="text-lg text-white/70">Conversaciones reales persistidas en Supabase</p>
        </div>

        {error && (
          <GlassCard className="p-6 mb-6 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          <div className="lg:col-span-4">
            <GlassCard className="h-full flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="p-4 border-b border-white/5">
                        <div className="h-14 bg-white/5 rounded-xl" />
                      </div>
                    ))
                  : filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                          selectedConversation?.id === conversation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white truncate">{conversation.name}</h3>
                            <span className="text-xs text-white/50 flex-shrink-0 ml-2">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-white/60 mb-1 truncate">{conversation.role}</p>
                          <p className="text-sm text-white/70 truncate">{conversation.lastMessage}</p>
                        </div>
                      </button>
                    ))}

                {!loading && filteredConversations.length === 0 && (
                  <div className="p-6 text-white/60">Todavía no tienes conversaciones activas.</div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-8">
            <GlassCard className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-white">{selectedConversation.name}</h3>
                        <p className="text-sm text-white/60">{selectedConversation.role}</p>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {threadLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-16 bg-white/5 rounded-2xl" />
                      ))
                    ) : thread.items.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-white/50">
                        Aún no hay mensajes en esta conversación.
                      </div>
                    ) : (
                      thread.items.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                              message.isOwn
                                ? 'bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white'
                                : 'bg-white/5 border border-white/10 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-[11px] mt-2 opacity-70">{message.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleSendMessage();
                          }
                        }}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563EB]"
                      />
                      <button
                        onClick={() => void handleSendMessage()}
                        disabled={sending || !messageText.trim()}
                        className="px-5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-white/50">
                  Selecciona una conversación para comenzar.
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
