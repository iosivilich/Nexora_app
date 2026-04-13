import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { fetchConsultants } from '../../lib/api';
import type { ConsultantDirectoryItem } from '../../lib/backend-types';

interface ConversationItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  consultant: ConsultantDirectoryItem;
}

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const previewTimes = ['Hace 5 min', 'Hace 30 min', 'Hace 2 horas', 'Ayer', 'Hace 2 días'];

function buildConversationPreview(consultant: ConsultantDirectoryItem, index: number): ConversationItem {
  const mainExpertise = consultant.expertise[0] ?? 'estrategia';

  return {
    id: consultant.id,
    name: consultant.name,
    role: consultant.role,
    avatar: consultant.image,
    lastMessage: `Tengo disponibilidad para conversar sobre ${mainExpertise.toLowerCase()} y el alcance del reto.`,
    time: previewTimes[index] ?? 'Esta semana',
    unread: index === 0 ? 2 : index === 1 ? 1 : 0,
    online: index % 2 === 0,
    consultant,
  };
}

function buildInitialMessages(conversation: ConversationItem | null): ChatMessage[] {
  if (!conversation) {
    return [];
  }

  return [
    {
      id: `${conversation.id}-1`,
      text: `Hola, soy ${conversation.name}. Vi que estás explorando perfiles para nuevos retos en Nexora.`,
      time: '10:30 AM',
      isOwn: false,
    },
    {
      id: `${conversation.id}-2`,
      text: 'Perfecto. Quiero entender mejor tu experiencia y el tipo de proyectos donde generas más impacto.',
      time: '10:35 AM',
      isOwn: true,
    },
    {
      id: `${conversation.id}-3`,
      text: `Puedo ayudarte especialmente en ${conversation.consultant.expertise.join(', ')} y compartir casos recientes.`,
      time: '10:37 AM',
      isOwn: false,
    },
  ];
}

export function MessagesPage() {
  const [consultants, setConsultants] = useState<ConsultantDirectoryItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchConsultants()
      .then((response) => {
        if (active) {
          setConsultants(response.items);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar los mensajes demo.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const conversations = consultants.map((consultant, index) =>
    buildConversationPreview(consultant, index),
  );

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [selectedConversationId, conversations]);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
  const visibleMessages =
    (selectedConversation && messageStore[selectedConversation.id]) ??
    buildInitialMessages(selectedConversation);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `${selectedConversation.id}-${Date.now()}`,
      text: messageText.trim(),
      time: 'Ahora',
      isOwn: true,
    };

    setMessageStore((current) => ({
      ...current,
      [selectedConversation.id]: [...visibleMessages, newMessage],
    }));
    setMessageText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mensajes
          </h1>
          <p className="text-lg text-white/70">
            Comunícate con consultores y gestiona tus conversaciones
          </p>
          <p className="text-sm text-[#9CC2FF] mt-2">
            Conversaciones demo construidas sobre perfiles reales cargados desde Supabase.
          </p>
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
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
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
                        <div className="relative flex-shrink-0">
                          <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A1F44]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white truncate">{conversation.name}</h3>
                            <span className="text-xs text-white/50 flex-shrink-0 ml-2">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-white/60 mb-1 truncate">{conversation.role}</p>
                          <p className="text-sm text-white/70 truncate">{conversation.lastMessage}</p>
                        </div>

                        {conversation.unread > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{conversation.unread}</span>
                          </div>
                        )}
                      </button>
                    ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-8">
            <GlassCard className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedConversation.avatar}
                          alt={selectedConversation.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {selectedConversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A1F44]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white">{selectedConversation.name}</h3>
                        <p className="text-sm text-white/60">{selectedConversation.role}</p>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {visibleMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.isOwn
                                ? 'bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-white/50">{message.time}</span>
                            {message.isOwn && <CheckCheck className="w-4 h-4 text-[#22C55E]" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-end gap-3">
                      <button className="p-3 hover:bg-white/5 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5 text-white/60" />
                      </button>

                      <div className="flex-1">
                        <textarea
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Escribe un mensaje..."
                          rows={1}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-[#2563EB]/30"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/50">Selecciona una conversación para empezar.</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
