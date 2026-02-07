import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, getDoc, getDocs,
  serverTimestamp, Timestamp, limit as fbLimit
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ChatThread, ChatMessage, UserProfile, censorMessage } from '@/lib/data';

interface FirebaseChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'file';
  timestamp: Timestamp | null;
  censored?: boolean;
}

export function useFirebaseChat() {
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to user's chat threads
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const threads: ChatThread[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const otherUid = (data.participants as string[]).find(p => p !== uid) || '';
        
        // Get other user's profile
        let otherUser: UserProfile = {
          id: otherUid,
          uid: otherUid.substring(0, 8).toUpperCase(),
          name: 'User',
          age: 0,
          gender: '',
          bio: '',
          interests: [],
          avatar: '',
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', otherUid));
          if (userDoc.exists()) {
            const u = userDoc.data();
            otherUser = {
              id: otherUid,
              uid: u.uid || otherUid.substring(0, 8).toUpperCase(),
              name: u.name || 'User',
              age: u.dob ? calculateAge(u.dob) : 0,
              gender: u.gender || '',
              bio: u.bio || '',
              interests: u.interests || [],
              avatar: u.profileImage || '',
              city: u.city,
              country: u.country,
            };
          }
        } catch {}

        threads.push({
          id: docSnap.id,
          user: otherUser,
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unread: data[`unread_${uid}`] || 0,
        });
      }
      setChats(threads);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, []);

  // Start or get existing chat with a user
  const startChat = useCallback(async (otherUserId: string): Promise<string | null> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const participants = d.data().participants as string[];
      if (participants.includes(otherUserId)) {
        return d.id;
      }
    }

    // Create new chat
    const chatDoc = await addDoc(collection(db, 'chats'), {
      participants: [uid, otherUserId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      [`unread_${uid}`]: 0,
      [`unread_${otherUserId}`]: 0,
      createdAt: serverTimestamp(),
    });

    return chatDoc.id;
  }, []);

  return { chats, loading, startChat };
}

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type || 'text',
          censored: data.censored,
        };
      });
      setMessages(msgs);
    });

    // Mark as read
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'chats', chatId), { [`unread_${uid}`]: 0 }, { merge: true }).catch(() => {});
    }

    return unsub;
  }, [chatId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!chatId || !text.trim()) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const { censored, hasViolation } = censorMessage(text.trim());

    // Get other participant to increment their unread
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    const participants = chatDoc.data()?.participants as string[] || [];
    const otherUid = participants.find(p => p !== uid) || '';

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: uid,
      text: censored,
      type: 'text',
      timestamp: serverTimestamp(),
      censored: hasViolation,
    });

    // Update chat thread
    const unreadKey = `unread_${otherUid}`;
    const currentUnread = chatDoc.data()?.[unreadKey] || 0;
    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: censored,
      lastMessageTime: serverTimestamp(),
      [unreadKey]: currentUnread + 1,
    }, { merge: true });
  }, [chatId]);

  return { messages, sendMessage };
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
