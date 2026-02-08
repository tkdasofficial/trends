import { useState, useEffect, useCallback, useRef } from 'react';
import { onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getPeer, WebRTCPeer, D2DMessage } from '@/lib/webrtcPeer';
import {
  LocalMessage, LocalChat, getLocalChats, saveLocalChat, getLocalMessages,
  saveLocalMessage, updateChatUnread, saveFileRecord,
} from '@/lib/localStore';
import { ChatThread, ChatMessage, UserProfile, censorMessage } from '@/lib/data';
import { getDoc } from 'firebase/firestore';

// ─── Chat List (from localStorage + Firebase profiles) ───────────────────────

export function useD2DChats() {
  const [chats, setChats] = useState<ChatThread[]>([]);

  const refreshChats = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const localChats = getLocalChats();
    const threads: ChatThread[] = localChats.map(lc => ({
      id: lc.peerId,
      user: {
        id: lc.peerId,
        uid: lc.peerUid,
        name: lc.peerName,
        age: 0,
        gender: '',
        bio: '',
        interests: [],
        avatar: lc.peerAvatar,
      },
      lastMessage: lc.lastMessage,
      lastMessageTime: new Date(lc.lastTime),
      unread: lc.unread,
    }));

    setChats(threads);
  }, []);

  useEffect(() => {
    refreshChats();
    // Refresh periodically to pick up new messages
    const interval = setInterval(refreshChats, 2000);
    return () => clearInterval(interval);
  }, [refreshChats]);

  const startChat = useCallback(async (user: UserProfile): Promise<string | null> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    // Save to local chats
    saveLocalChat({
      peerId: user.id,
      peerName: user.name,
      peerAvatar: user.avatar,
      peerUid: user.uid,
      lastMessage: '',
      lastTime: new Date().toISOString(),
      unread: 0,
    });

    refreshChats();
    return user.id;
  }, [refreshChats]);

  return { chats, startChat, refreshChats };
}

// ─── D2D Chat Messages (WebRTC DataChannel + localStorage) ───────────────────

export function useD2DChatMessages(peerId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerStatus, setPeerStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [fileTransfers, setFileTransfers] = useState<Map<string, FileTransferState>>(new Map());
  const peerRef = useRef<WebRTCPeer | null>(null);
  const fileChunksRef = useRef<Map<string, ArrayBuffer[]>>(new Map());
  const fileMetaRef = useRef<Map<string, { fileName: string; fileSize: number; fileType: string; totalChunks: number }>>(new Map());
  const pendingFileRef = useRef<File | null>(null);

  // Load messages from localStorage
  useEffect(() => {
    if (!peerId) return;
    const local = getLocalMessages(peerId);
    setMessages(local.map(m => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      timestamp: new Date(m.timestamp),
      type: m.type as any,
      censored: false,
    })));
  }, [peerId]);

  // Establish WebRTC connection
  useEffect(() => {
    if (!peerId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const peer = getPeer(peerId);
    peerRef.current = peer;

    peer.onStatusChange = (status) => {
      setPeerStatus(status === 'failed' ? 'disconnected' : status);
    };

    peer.onMessage = (msg: D2DMessage) => {
      if (msg.type === 'chat') {
        const chatMsg: LocalMessage = {
          id: msg.id,
          senderId: peerId,
          text: msg.payload.text,
          timestamp: msg.timestamp,
          type: 'text',
          status: 'delivered',
        };
        saveLocalMessage(peerId, chatMsg);
        setMessages(prev => [...prev, {
          id: msg.id,
          senderId: peerId,
          text: msg.payload.text,
          timestamp: new Date(msg.timestamp),
          type: 'text',
        }]);

        // Update chat entry
        saveLocalChat({
          peerId,
          peerName: msg.payload.senderName || 'User',
          peerAvatar: '',
          peerUid: '',
          lastMessage: msg.payload.text,
          lastTime: msg.timestamp,
          unread: 0,
        });
      }

      if (msg.type === 'file-request') {
        const ft: FileTransferState = {
          id: msg.payload.requestId,
          fileName: msg.payload.fileName,
          fileSize: msg.payload.fileSize,
          fileType: msg.payload.fileType,
          direction: 'incoming',
          status: 'pending',
          progress: 0,
        };
        setFileTransfers(prev => new Map(prev).set(ft.id, ft));
        fileMetaRef.current.set(msg.payload.requestId, {
          fileName: msg.payload.fileName,
          fileSize: msg.payload.fileSize,
          fileType: msg.payload.fileType,
          totalChunks: msg.payload.totalChunks || 0,
        });
        fileChunksRef.current.set(msg.payload.requestId, []);
      }

      if (msg.type === 'file-accept') {
        const id = msg.payload.requestId;
        setFileTransfers(prev => {
          const map = new Map(prev);
          const ft = map.get(id);
          if (ft) map.set(id, { ...ft, status: 'transferring' });
          return map;
        });
        // Start sending the file
        const file = pendingFileRef.current;
        if (file && peerRef.current) {
          peerRef.current.sendFile(file, id, (pct) => {
            setFileTransfers(prev => {
              const map = new Map(prev);
              const ft = map.get(id);
              if (ft) map.set(id, { ...ft, progress: pct, status: pct >= 100 ? 'completed' : 'transferring' });
              return map;
            });
          }).then(() => {
            saveFileRecord({
              id, chatPeerId: peerId, fileName: file.name, fileSize: file.size,
              fileType: file.type, direction: 'sent', timestamp: new Date().toISOString(), status: 'completed',
            });
            pendingFileRef.current = null;
          }).catch(() => {
            setFileTransfers(prev => {
              const map = new Map(prev);
              const ft = map.get(id);
              if (ft) map.set(id, { ...ft, status: 'failed' });
              return map;
            });
          });
        }
      }

      if (msg.type === 'file-reject') {
        const id = msg.payload.requestId;
        setFileTransfers(prev => {
          const map = new Map(prev);
          const ft = map.get(id);
          if (ft) map.set(id, { ...ft, status: 'rejected' });
          return map;
        });
        pendingFileRef.current = null;
      }

      if (msg.type === ('file-complete' as any)) {
        const id = msg.payload.requestId;
        const chunks = fileChunksRef.current.get(id);
        const meta = fileMetaRef.current.get(id);
        if (chunks && meta) {
          // Assemble file and download
          const blob = new Blob(chunks, { type: meta.fileType || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = meta.fileName;
          a.click();
          URL.revokeObjectURL(url);

          setFileTransfers(prev => {
            const map = new Map(prev);
            const ft = map.get(id);
            if (ft) map.set(id, { ...ft, status: 'completed', progress: 100 });
            return map;
          });

          saveFileRecord({
            id, chatPeerId: peerId, fileName: meta.fileName, fileSize: meta.fileSize,
            fileType: meta.fileType, direction: 'received', timestamp: new Date().toISOString(), status: 'completed',
          });

          // Add system message
          const sysMsg: LocalMessage = {
            id: `file_${id}`,
            senderId: peerId,
            text: `📎 File received: ${meta.fileName}`,
            timestamp: new Date().toISOString(),
            type: 'file',
            fileName: meta.fileName,
            fileSize: meta.fileSize,
          };
          saveLocalMessage(peerId, sysMsg);
          setMessages(prev => [...prev, {
            id: sysMsg.id, senderId: peerId, text: sysMsg.text,
            timestamp: new Date(), type: 'file',
          }]);
        }
        fileChunksRef.current.delete(id);
        fileMetaRef.current.delete(id);
      }
    };

    peer.onBinaryData = (data: ArrayBuffer, meta) => {
      const chunks = fileChunksRef.current.get(meta.requestId);
      if (chunks) {
        chunks.push(data);
        const fileMeta = fileMetaRef.current.get(meta.requestId);
        if (fileMeta && fileMeta.fileSize > 0) {
          const received = chunks.reduce((sum, c) => sum + c.byteLength, 0);
          const pct = Math.min(99, Math.round((received / fileMeta.fileSize) * 100));
          setFileTransfers(prev => {
            const map = new Map(prev);
            const ft = map.get(meta.requestId);
            if (ft) map.set(meta.requestId, { ...ft, progress: pct });
            return map;
          });
        }
      }
    };

    // Connect if not already
    if (!peer.isConnected() && peer.status !== 'connecting') {
      peer.connect(false).catch(err => {
        console.error('WebRTC connect failed:', err);
        setPeerStatus('disconnected');
      });
    } else if (peer.isConnected()) {
      setPeerStatus('connected');
    }

    return () => {
      // Don't cleanup peer on unmount — keep connection alive
    };
  }, [peerId]);

  // Listen for incoming connections
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(db, 'peerInbox', uid), async (snap) => {
      const data = snap.data();
      if (!data || !data.signalId) return;

      const callerId = data.callerId;
      if (!callerId || callerId === peerId) return; // Already handling this peer

      // Auto-answer for chat (not audio)
      if (!data.withAudio) {
        const peer = getPeer(callerId);
        try {
          await peer.answer(data.signalId);
        } catch (err) {
          console.error('Failed to answer peer connection:', err);
        }
        deleteDoc(doc(db, 'peerInbox', uid)).catch(() => {});
      }
    });

    return unsub;
  }, [peerId]);

  const sendMessage = useCallback((text: string) => {
    if (!peerId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const { censored } = censorMessage(text);
    const msgId = `${uid}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    const localMsg: LocalMessage = {
      id: msgId,
      senderId: uid,
      text: censored,
      timestamp,
      type: 'text',
      status: peerRef.current?.isConnected() ? 'sent' : 'failed',
    };

    // Save locally
    saveLocalMessage(peerId, localMsg);
    setMessages(prev => [...prev, {
      id: msgId, senderId: uid, text: censored,
      timestamp: new Date(), type: 'text',
    }]);

    // Update chat entry
    const chats = getLocalChats();
    const chat = chats.find(c => c.peerId === peerId);
    if (chat) {
      saveLocalChat({ ...chat, lastMessage: censored, lastTime: timestamp });
    }

    // Send via WebRTC
    const peer = peerRef.current;
    if (peer?.isConnected()) {
      peer.sendMessage({
        type: 'chat',
        id: msgId,
        payload: { text: censored, senderName: auth.currentUser?.displayName || '' },
        timestamp,
      });
    }
  }, [peerId]);

  const sendFile = useCallback((file: File) => {
    if (!peerId || !peerRef.current?.isConnected()) return;

    const requestId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    pendingFileRef.current = file;

    // Send file request to peer
    peerRef.current.sendMessage({
      type: 'file-request',
      id: requestId,
      payload: {
        requestId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks: Math.ceil(file.size / 16384),
      },
      timestamp: new Date().toISOString(),
    });

    // Add to local transfers
    setFileTransfers(prev => new Map(prev).set(requestId, {
      id: requestId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      direction: 'outgoing',
      status: 'pending',
      progress: 0,
    }));

    // Add system message
    const sysMsg: LocalMessage = {
      id: `filesend_${requestId}`,
      senderId: auth.currentUser?.uid || '',
      text: `📎 Sending file: ${file.name}`,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileName: file.name,
      fileSize: file.size,
    };
    saveLocalMessage(peerId, sysMsg);
    setMessages(prev => [...prev, {
      id: sysMsg.id, senderId: auth.currentUser?.uid || '', text: sysMsg.text,
      timestamp: new Date(), type: 'file',
    }]);
  }, [peerId]);

  const acceptFile = useCallback((requestId: string) => {
    if (!peerRef.current?.isConnected()) return;
    peerRef.current.sendMessage({
      type: 'file-accept',
      id: `accept_${requestId}`,
      payload: { requestId },
      timestamp: new Date().toISOString(),
    });
    setFileTransfers(prev => {
      const map = new Map(prev);
      const ft = map.get(requestId);
      if (ft) map.set(requestId, { ...ft, status: 'transferring' });
      return map;
    });
  }, []);

  const rejectFile = useCallback((requestId: string) => {
    if (!peerRef.current?.isConnected()) return;
    peerRef.current.sendMessage({
      type: 'file-reject',
      id: `reject_${requestId}`,
      payload: { requestId },
      timestamp: new Date().toISOString(),
    });
    setFileTransfers(prev => {
      const map = new Map(prev);
      const ft = map.get(requestId);
      if (ft) map.set(requestId, { ...ft, status: 'rejected' });
      return map;
    });
  }, []);

  // Mark as read
  useEffect(() => {
    if (peerId) updateChatUnread(peerId, 0);
  }, [peerId]);

  return {
    messages, sendMessage, peerStatus,
    sendFile, fileTransfers, acceptFile, rejectFile,
  };
}

export interface FileTransferState {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  direction: 'incoming' | 'outgoing';
  status: 'pending' | 'transferring' | 'completed' | 'failed' | 'rejected';
  progress: number;
}
