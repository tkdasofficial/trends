import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChatThread, ChatMessage, censorMessage } from '@/lib/data';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { useChatMessages } from '@/hooks/useFirebaseChat';
import { auth } from '@/lib/firebase';

interface ChatViewProps {
  chat: ChatThread;
  onBack: () => void;
  onViewProfile?: () => void;
  onCall?: () => void;
}

export function ChatView({ chat, onBack, onViewProfile, onCall }: ChatViewProps) {
  const { messages, sendMessage } = useChatMessages(chat.id);
  const [input, setInput] = useState('');
  const [violations, setViolations] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const { censored, hasViolation } = censorMessage(input.trim());
    if (hasViolation) setViolations(prev => prev + 1);
    sendMessage(input.trim());
    setInput('');
  }, [input, sendMessage]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onViewProfile}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden gradient-primary text-sm font-bold text-primary-foreground sm:h-10 sm:w-10"
        >
          {chat.user.avatar ? (
            <img src={chat.user.avatar} alt={chat.user.name} className="h-full w-full object-cover" />
          ) : (
            chat.user.name[0]
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{chat.user.name}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        {onCall && (
          <motion.button
            onClick={onCall}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Phone className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Violation warning */}
      {violations > 0 && violations <= 10 && (
        <div className="mx-3 mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive text-center sm:mx-5">
          ⚠️ Content warning: {violations}/10 violations
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:px-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.senderId === currentUid ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[75%] sm:px-4 ${
                msg.senderId === currentUid
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-4"
            maxLength={500}
          />
          <motion.button
            onClick={handleSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground"
            whileTap={{ scale: 0.9 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
