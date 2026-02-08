import { auth } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  status?: 'sent' | 'delivered' | 'failed';
}

export interface LocalChat {
  peerId: string;        // Firebase UID of the other user
  peerName: string;
  peerAvatar: string;
  peerUid: string;       // TR-XXXX display UID
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface CallRecord {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  direction: 'incoming' | 'outgoing';
  duration: number;       // seconds
  timestamp: string;
  status: 'completed' | 'missed' | 'rejected';
}

export interface FileRecord {
  id: string;
  chatPeerId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  direction: 'sent' | 'received';
  timestamp: string;
  status: 'completed' | 'failed';
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

function uid() {
  return auth.currentUser?.uid || 'anon';
}

function chatsKey() { return `trends_chats_${uid()}`; }
function messagesKey(peerId: string) { return `trends_msgs_${uid()}_${peerId}`; }
function callsKey() { return `trends_calls_${uid()}`; }
function filesKey() { return `trends_files_${uid()}`; }

// ─── Chats ────────────────────────────────────────────────────────────────────

export function getLocalChats(): LocalChat[] {
  try {
    return JSON.parse(localStorage.getItem(chatsKey()) || '[]');
  } catch { return []; }
}

export function saveLocalChat(chat: LocalChat) {
  const chats = getLocalChats();
  const idx = chats.findIndex(c => c.peerId === chat.peerId);
  if (idx >= 0) {
    chats[idx] = { ...chats[idx], ...chat };
  } else {
    chats.unshift(chat);
  }
  // Sort by last message time descending
  chats.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
  localStorage.setItem(chatsKey(), JSON.stringify(chats));
}

export function updateChatUnread(peerId: string, unread: number) {
  const chats = getLocalChats();
  const idx = chats.findIndex(c => c.peerId === peerId);
  if (idx >= 0) {
    chats[idx].unread = unread;
    localStorage.setItem(chatsKey(), JSON.stringify(chats));
  }
}

export function deleteLocalChat(peerId: string) {
  const chats = getLocalChats().filter(c => c.peerId !== peerId);
  localStorage.setItem(chatsKey(), JSON.stringify(chats));
  localStorage.removeItem(messagesKey(peerId));
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function getLocalMessages(peerId: string): LocalMessage[] {
  try {
    return JSON.parse(localStorage.getItem(messagesKey(peerId)) || '[]');
  } catch { return []; }
}

export function saveLocalMessage(peerId: string, msg: LocalMessage) {
  const msgs = getLocalMessages(peerId);
  // Avoid duplicates
  if (msgs.some(m => m.id === msg.id)) return;
  msgs.push(msg);
  // Keep last 500 messages per conversation
  const trimmed = msgs.slice(-500);
  localStorage.setItem(messagesKey(peerId), JSON.stringify(trimmed));
}

// ─── Call History ─────────────────────────────────────────────────────────────

export function getCallHistory(): CallRecord[] {
  try {
    return JSON.parse(localStorage.getItem(callsKey()) || '[]');
  } catch { return []; }
}

export function saveCallRecord(record: CallRecord) {
  const calls = getCallHistory();
  calls.unshift(record);
  // Keep last 100 calls
  localStorage.setItem(callsKey(), JSON.stringify(calls.slice(0, 100)));
}

// ─── File History ─────────────────────────────────────────────────────────────

export function getFileHistory(): FileRecord[] {
  try {
    return JSON.parse(localStorage.getItem(filesKey()) || '[]');
  } catch { return []; }
}

export function saveFileRecord(record: FileRecord) {
  const files = getFileHistory();
  files.unshift(record);
  localStorage.setItem(filesKey(), JSON.stringify(files.slice(0, 200)));
}

export function getFilesForChat(peerId: string): FileRecord[] {
  return getFileHistory().filter(f => f.chatPeerId === peerId);
}
