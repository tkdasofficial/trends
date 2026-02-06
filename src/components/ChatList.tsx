import { motion } from 'framer-motion';
import { ChatThread } from '@/lib/data';

interface ChatListProps {
  chats: ChatThread[];
  onSelect: (chat: ChatThread) => void;
  onViewProfile?: (chat: ChatThread) => void;
}

export function ChatList({ chats, onSelect, onViewProfile }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center py-20">
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
          className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:px-6 sm:py-4"
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

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}
