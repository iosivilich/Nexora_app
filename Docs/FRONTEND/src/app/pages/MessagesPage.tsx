import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const conversations = [
  {
    id: 1,
    name: 'María González',
    role: 'Consultora Digital',
    avatar: 'https://images.unsplash.com/photo-1613473350016-1fe047d6d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'Perfecto, podemos reunirnos la próxima semana para discutir el proyecto.',
    time: 'Hace 5 min',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    role: 'Experto en Cambio',
    avatar: 'https://images.unsplash.com/photo-1530281834572-02d15fa61f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzNTQxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'Gracias por compartir los documentos. Los revisaré esta tarde.',
    time: 'Hace 1 hora',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Ana Chen',
    role: 'Estrategia Empresarial',
    avatar: 'https://images.unsplash.com/photo-1758369636875-60b3dcb76366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzQwMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: '¿Podríamos agendar una llamada para mañana?',
    time: 'Hace 3 horas',
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: 'Diego Ramírez',
    role: 'Marketing Digital',
    avatar: 'https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMG1hbGUlMjBjb25zdWx0YW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NDAzNDE4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'Excelente propuesta. Estoy muy interesado en colaborar.',
    time: 'Ayer',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Marcus Johnson',
    role: 'Finanzas Corporativas',
    avatar: 'https://images.unsplash.com/photo-1616804947838-6646ae0e423d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzQwMzQxODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'He enviado el análisis financiero que solicitaste.',
    time: 'Hace 2 días',
    unread: 0,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    sender: 'María González',
    text: 'Hola, vi tu proyecto de transformación digital y me parece muy interesante.',
    time: '10:30 AM',
    isOwn: false,
  },
  {
    id: 2,
    sender: 'Tú',
    text: 'Muchas gracias por tu interés. ¿Tienes experiencia en el sector bancario?',
    time: '10:35 AM',
    isOwn: true,
  },
  {
    id: 3,
    sender: 'María González',
    text: 'Sí, he liderado 3 proyectos de transformación digital en bancos europeos en los últimos 2 años.',
    time: '10:37 AM',
    isOwn: false,
  },
  {
    id: 4,
    sender: 'María González',
    text: 'Puedo compartirte algunos casos de éxito si te interesa.',
    time: '10:37 AM',
    isOwn: false,
  },
  {
    id: 5,
    sender: 'Tú',
    text: 'Eso sería genial. ¿Podríamos programar una videollamada esta semana?',
    time: '10:42 AM',
    isOwn: true,
  },
  {
    id: 6,
    sender: 'María González',
    text: 'Perfecto, podemos reunirnos la próxima semana para discutir el proyecto.',
    time: '10:45 AM',
    isOwn: false,
  },
];

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Aquí iría la lógica para enviar el mensaje
      setMessageText('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mensajes
          </h1>
          <p className="text-lg text-white/70">
            Comunícate con consultores y gestiona tus conversaciones
          </p>
        </div>

        {/* Messages Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Conversations List */}
          <div className="lg:col-span-4">
            <GlassCard className="h-full flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                      selectedConversation.id === conv.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0A1F44]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white truncate">{conv.name}</h3>
                        <span className="text-xs text-white/50 flex-shrink-0 ml-2">{conv.time}</span>
                      </div>
                      <p className="text-sm text-white/60 mb-1 truncate">{conv.role}</p>
                      <p className="text-sm text-white/70 truncate">{conv.lastMessage}</p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="flex-shrink-0 w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{conv.unread}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8">
            <GlassCard className="h-full flex flex-col">
              {/* Chat Header */}
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
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

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-end gap-3">
                  <button className="p-3 hover:bg-white/5 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-white/60" />
                  </button>

                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
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
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
