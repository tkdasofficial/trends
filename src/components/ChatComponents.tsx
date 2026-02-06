import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatThread, ChatMessage, censorMessage } from '@/lib/data';
import { ArrowLeft, Send, Paperclip, Phone, PhoneOff } from 'lucide-react';

interface ChatListProps {
  chats: ChatThread[];
  onSelect: (chat: ChatThread) => void;
  onViewProfile?: (chat: ChatThread) => void;
}

export function ChatList({ chats, onSelect, onViewProfile }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-lg font-semibold text-foreground">No chats yet</p>
        <p className="text-sm text-muted-foreground">Start matching to chat!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat, i) => (
        <motion.button
          key={chat.id}
          onClick={() => onSelect(chat)}
          className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:px-5 sm:py-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(chat);
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground sm:h-12 sm:w-12"
          >
            {chat.user.name[0]}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{chat.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(chat.lastMessageTime)}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
          </div>
          {chat.unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {chat.unread}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

interface ChatViewProps {
  chat: ChatThread;
  onBack: () => void;
  onViewProfile?: () => void;
}

export function ChatView({ chat, onBack, onViewProfile }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: chat.user.id, text: chat.lastMessage, timestamp: chat.lastMessageTime, type: 'text' },
  ]);
  const [input, setInput] = useState('');
  const [violations, setViolations] = useState(0);
  const [inCall, setInCall] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const { censored, hasViolation } = censorMessage(input.trim());
    if (hasViolation) setViolations(prev => prev + 1);

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), senderId: 'me', text: censored, timestamp: new Date(), type: 'text', censored: hasViolation },
    ]);
    setInput('');
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onViewProfile}
          className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground"
        >
          {chat.user.name[0]}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{chat.user.name}</p>
          <p className="text-xs text-muted-foreground">{inCall ? '🔊 In call...' : 'Online'}</p>
        </div>
        {/* Call button */}
        <motion.button
          onClick={() => setInCall(!inCall)}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            inCall
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          {inCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Call banner */}
      {inCall && (
        <motion.div
          className="flex items-center justify-between gradient-primary px-4 py-2.5"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary-foreground animate-pulse" />
            <span className="text-sm font-medium text-primary-foreground">Audio call with {chat.user.name}</span>
          </div>
          <button
            onClick={() => setInCall(false)}
            className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground"
          >
            End
          </button>
        </motion.div>
      )}

      {/* Violation warning */}
      {violations > 0 && violations <= 10 && (
        <div className="mx-3 mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive text-center sm:mx-4">
          ⚠️ Content warning: {violations}/10 violations
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:px-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[75%] sm:px-4 ${
                msg.senderId === 'me'
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input - fixed at bottom */}
      <div className="border-t border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground shrink-0">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-4"
            maxLength={500}
          />
          <motion.button
            onClick={sendMessage}
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

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}
