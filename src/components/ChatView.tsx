import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatThread, ChatMessage, censorMessage } from '@/lib/data';
import { ArrowLeft, Send, Phone, Paperclip, Wifi, WifiOff, FileText, Image, Film, X, Check, Loader2, Download, AlertTriangle } from 'lucide-react';
import { useD2DChatMessages, FileTransferState } from '@/hooks/useD2DChat';
import { auth } from '@/lib/firebase';

interface ChatViewProps {
  chat: ChatThread;
  onBack: () => void;
  onViewProfile?: () => void;
  onCall?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  return FileText;
}

export function ChatView({ chat, onBack, onViewProfile, onCall }: ChatViewProps) {
  const {
    messages, sendMessage, peerStatus,
    sendFile, fileTransfers, acceptFile, rejectFile,
  } = useD2DChatMessages(chat.id);

  const [input, setInput] = useState('');
  const [violations, setViolations] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, fileTransfers]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const { censored, hasViolation } = censorMessage(input.trim());
    if (hasViolation) setViolations(prev => prev + 1);
    sendMessage(input.trim());
    setInput('');
  }, [input, sendMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const transfersList = Array.from(fileTransfers.values());

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
          <p className="text-xs flex items-center gap-1">
            {peerStatus === 'connected' ? (
              <><Wifi className="h-3 w-3 text-green-500" /> <span className="text-green-500">Connected (D2D)</span></>
            ) : peerStatus === 'connecting' ? (
              <><Loader2 className="h-3 w-3 text-amber-500 animate-spin" /> <span className="text-amber-500">Connecting...</span></>
            ) : (
              <><WifiOff className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Offline</span></>
            )}
          </p>
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

      {/* D2D info banner */}
      {peerStatus === 'disconnected' && (
        <div className="mx-3 mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-center sm:mx-5">
          <span className="text-amber-600 dark:text-amber-400">
            💡 Both users must be online for D2D messaging. Messages are stored locally on your device.
          </span>
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

        {/* File transfer cards */}
        {transfersList.map(ft => (
          <FileTransferCard
            key={ft.id}
            transfer={ft}
            isMine={ft.direction === 'outgoing'}
            onAccept={() => acceptFile(ft.id)}
            onReject={() => rejectFile(ft.id)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={peerStatus !== 'connected'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip className="h-4 w-4" />
          </motion.button>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={peerStatus === 'connected' ? 'Type a message...' : 'Waiting for connection...'}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-4"
            maxLength={500}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground disabled:opacity-40"
            whileTap={{ scale: 0.9 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── File Transfer Card ─────────────────────────────────────────────────────

function FileTransferCard({
  transfer,
  isMine,
  onAccept,
  onReject,
}: {
  transfer: FileTransferState;
  isMine: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const Icon = getFileIcon(transfer.fileType);

  return (
    <motion.div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`max-w-[85%] rounded-2xl p-3 sm:max-w-[75%] ${isMine ? 'gradient-primary' : 'bg-muted'}`}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isMine ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${isMine ? 'text-primary-foreground' : 'text-primary'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium truncate ${isMine ? 'text-primary-foreground' : 'text-foreground'}`}>{transfer.fileName}</p>
            <p className={`text-xs ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {formatFileSize(transfer.fileSize)}
            </p>
          </div>
        </div>

        {/* Pending - accept/reject for receiver */}
        {transfer.status === 'pending' && !isMine && (
          <div className="flex items-center gap-2">
            <motion.button onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2 text-xs font-semibold text-white"
              whileTap={{ scale: 0.95 }}>
              <Download className="h-3.5 w-3.5" /> Accept
            </motion.button>
            <motion.button onClick={onReject}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2 text-xs font-semibold text-destructive-foreground"
              whileTap={{ scale: 0.95 }}>
              <X className="h-3.5 w-3.5" /> Reject
            </motion.button>
          </div>
        )}

        {transfer.status === 'pending' && isMine && (
          <p className={`text-xs ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            Waiting for acceptance...
          </p>
        )}

        {transfer.status === 'transferring' && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Loader2 className={`h-3.5 w-3.5 animate-spin ${isMine ? 'text-primary-foreground' : 'text-primary'}`} />
              <span className={`text-xs ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {isMine ? 'Sending' : 'Receiving'}... {transfer.progress}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isMine ? 'bg-primary-foreground/20' : 'bg-border'}`}>
              <motion.div
                className={`h-full rounded-full ${isMine ? 'bg-primary-foreground' : 'gradient-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${transfer.progress}%` }}
              />
            </div>
          </div>
        )}

        {transfer.status === 'completed' && (
          <p className={`text-xs flex items-center gap-1.5 ${isMine ? 'text-primary-foreground/70' : 'text-green-600'}`}>
            <Check className="h-3.5 w-3.5" /> {isMine ? 'File sent' : 'File downloaded'}
          </p>
        )}

        {transfer.status === 'rejected' && (
          <p className={`text-xs flex items-center gap-1.5 ${isMine ? 'text-primary-foreground/70' : 'text-destructive'}`}>
            <X className="h-3.5 w-3.5" /> File rejected
          </p>
        )}

        {transfer.status === 'failed' && (
          <p className={`text-xs flex items-center gap-1.5 ${isMine ? 'text-primary-foreground/70' : 'text-destructive'}`}>
            <AlertTriangle className="h-3.5 w-3.5" /> Transfer failed
          </p>
        )}
      </div>
    </motion.div>
  );
}
