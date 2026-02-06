import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChatThread, ChatMessage, censorMessage } from '@/lib/data';
import { ArrowLeft, Send, Paperclip, Phone } from 'lucide-react';
import { FileTransferIncoming, FileTransferOutgoing, useFileTransfer } from './FileTransfer';
import { AudioCallPage } from './AudioCallPage';

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
  const [callState, setCallState] = useState<null | 'outgoing' | 'incoming'>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { transfers, sendFile, receiveFile, acceptTransfer, rejectTransfer } = useFileTransfer();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transfers]);

  // Simulate incoming file after mount
  useEffect(() => {
    const t = setTimeout(() => {
      receiveFile('vacation_photo.jpg', 2_400_000, 'image/jpeg', chat.user.name);
    }, 4000);
    return () => clearTimeout(t);
  }, [receiveFile, chat.user.name]);

  // Simulate incoming call after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      setCallState('incoming');
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const { censored, hasViolation } = censorMessage(input.trim());
    if (hasViolation) setViolations(prev => prev + 1);

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), senderId: 'me', text: censored, timestamp: new Date(), type: 'text', censored: hasViolation },
    ]);
    setInput('');
  }, [input]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendFile(file);
    e.target.value = '';
  }, [sendFile]);

  if (callState) {
    return (
      <AudioCallPage
        user={chat.user}
        direction={callState}
        onEnd={() => setCallState(null)}
      />
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onViewProfile}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground sm:h-10 sm:w-10"
        >
          {chat.user.name[0]}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{chat.user.name}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <motion.button
          onClick={() => setCallState('outgoing')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Phone className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Violation warning */}
      {violations > 0 && violations <= 10 && (
        <div className="mx-3 mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive text-center sm:mx-5">
          ⚠️ Content warning: {violations}/10 violations
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:px-5">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[75%] sm:px-4 ${
                msg.senderId === 'me'
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* File transfers */}
        {transfers.map(t => (
          <div key={t.id} className={`flex ${t.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            {t.senderId === 'me' ? (
              <FileTransferOutgoing request={t} />
            ) : (
              <FileTransferIncoming request={t} onAccept={acceptTransfer} onReject={rejectTransfer} />
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground shrink-0 p-1"
          >
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
