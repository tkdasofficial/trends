import { useState, useEffect, useCallback, useRef } from 'react';
import { onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getPeer, removePeer, WebRTCPeer } from '@/lib/webrtcPeer';
import { saveCallRecord } from '@/lib/localStore';

type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended';

interface CallState {
  status: CallStatus;
  remoteUserId: string | null;
  duration: number;
  muted: boolean;
  speaker: boolean;
}

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    remoteUserId: null,
    duration: 0,
    muted: false,
    speaker: false,
  });

  const peerRef = useRef<WebRTCPeer | null>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const callerNameRef = useRef<string>('');
  const callerAvatarRef = useRef<string>('');

  const cleanup = useCallback(() => {
    if (durationRef.current) clearInterval(durationRef.current);
    durationRef.current = null;
    if (peerRef.current) {
      peerRef.current.cleanup();
      peerRef.current = null;
    }
  }, []);

  const startCall = useCallback(async (remoteUserId: string, remoteName?: string, remoteAvatar?: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    callerNameRef.current = remoteName || 'User';
    callerAvatarRef.current = remoteAvatar || '';
    setCallState(prev => ({ ...prev, status: 'outgoing', remoteUserId }));

    try {
      const peer = new WebRTCPeer(remoteUserId);
      peerRef.current = peer;

      peer.onStatusChange = (status) => {
        if (status === 'connected') {
          setCallState(prev => ({ ...prev, status: 'connected' }));
          startTimeRef.current = Date.now();
          durationRef.current = setInterval(() => {
            setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
          }, 1000);

          // Play remote audio
          const remoteStream = peer.getRemoteStream();
          if (remoteStream) {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(() => {});
          }
        } else if (status === 'disconnected' || status === 'failed') {
          endCallInternal('completed');
        }
      };

      peer.onRemoteStream = (stream) => {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play().catch(() => {});
      };

      await peer.connect(true); // with audio
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanup();
      setCallState({ status: 'ended', remoteUserId: null, duration: 0, muted: false, speaker: false });
    }
  }, [cleanup]);

  const endCallInternal = useCallback((status: 'completed' | 'missed' | 'rejected' = 'completed') => {
    const duration = callState.duration;
    const peerId = callState.remoteUserId || peerRef.current?.peerId;

    // Save call history
    if (peerId) {
      saveCallRecord({
        id: `call_${Date.now()}`,
        peerId,
        peerName: callerNameRef.current,
        peerAvatar: callerAvatarRef.current,
        direction: callState.status === 'incoming' ? 'incoming' : 'outgoing',
        duration,
        timestamp: new Date().toISOString(),
        status,
      });
    }

    cleanup();
    setCallState({ status: 'idle', remoteUserId: null, duration: 0, muted: false, speaker: false });
  }, [cleanup, callState]);

  const endCall = useCallback(() => {
    endCallInternal('completed');
  }, [endCallInternal]);

  const toggleMute = useCallback(() => {
    if (peerRef.current) {
      const muted = peerRef.current.toggleMute();
      setCallState(prev => ({ ...prev, muted }));
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    setCallState(prev => ({ ...prev, speaker: !prev.speaker }));
  }, []);

  // Listen for incoming audio calls
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(db, 'peerInbox', uid), async (snap) => {
      const data = snap.data();
      if (!data || !data.signalId || !data.withAudio) return;
      if (callState.status !== 'idle') return;

      setCallState(prev => ({
        ...prev,
        status: 'incoming',
        remoteUserId: data.callerId,
      }));

      callerNameRef.current = data.callerName || 'User';
    });

    return unsub;
  }, [callState.status]);

  const answerCall = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Get signal ID from inbox
      const inboxSnap = await (await import('firebase/firestore')).getDoc(doc(db, 'peerInbox', uid));
      const inboxData = inboxSnap.data();
      if (!inboxData?.signalId) return;

      const peer = new WebRTCPeer(inboxData.callerId);
      peerRef.current = peer;

      peer.onStatusChange = (status) => {
        if (status === 'connected') {
          setCallState(prev => ({ ...prev, status: 'connected' }));
          startTimeRef.current = Date.now();
          durationRef.current = setInterval(() => {
            setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
          }, 1000);
        } else if (status === 'disconnected' || status === 'failed') {
          endCallInternal('completed');
        }
      };

      peer.onRemoteStream = (stream) => {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play().catch(() => {});
      };

      await peer.answer(inboxData.signalId);
      deleteDoc(doc(db, 'peerInbox', uid)).catch(() => {});
    } catch (err) {
      console.error('Failed to answer call:', err);
      endCallInternal('missed');
    }
  }, [endCallInternal]);

  const rejectCall = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const inboxSnap = await (await import('firebase/firestore')).getDoc(doc(db, 'peerInbox', uid));
      const inboxData = inboxSnap.data();
      if (inboxData?.signalId) {
        const peer = new WebRTCPeer(inboxData.callerId);
        peer.reject(inboxData.signalId);
      }
      deleteDoc(doc(db, 'peerInbox', uid)).catch(() => {});
    } catch {}

    endCallInternal('rejected');
  }, [endCallInternal]);

  return {
    callState,
    startCall,
    endCall,
    answerCall,
    rejectCall,
    toggleMute,
    toggleSpeaker,
  };
}
