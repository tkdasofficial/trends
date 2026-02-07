import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot, deleteDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended';

interface CallState {
  status: CallStatus;
  remoteUserId: string | null;
  duration: number;
  muted: boolean;
  speaker: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    remoteUserId: null,
    duration: 0,
    muted: false,
    speaker: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callDocIdRef = useRef<string | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);

    // Clean up Firestore signaling doc
    if (callDocIdRef.current) {
      const uid = auth.currentUser?.uid;
      if (uid) {
        deleteDoc(doc(db, 'calls', callDocIdRef.current)).catch(() => {});
      }
    }
    callDocIdRef.current = null;
  }, []);

  const startCall = useCallback(async (remoteUserId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setCallState(prev => ({ ...prev, status: 'outgoing', remoteUserId }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      pc.ontrack = (e) => e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));

      // Create signaling document
      const callDocId = `${uid}_${remoteUserId}_${Date.now()}`;
      callDocIdRef.current = callDocId;

      // Collect ICE candidates
      const candidates: RTCIceCandidateInit[] = [];
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          addDoc(collection(db, 'calls', callDocId, 'offerCandidates'), e.candidate.toJSON()).catch(() => {});
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await setDoc(doc(db, 'calls', callDocId), {
        offer: { type: offer.type, sdp: offer.sdp },
        callerId: uid,
        receiverId: remoteUserId,
        status: 'ringing',
        createdAt: new Date().toISOString(),
      });

      // Listen for answer
      const unsub = onSnapshot(doc(db, 'calls', callDocId), async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallState(prev => ({ ...prev, status: 'connected' }));

          // Start duration timer
          durationIntervalRef.current = setInterval(() => {
            setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
          }, 1000);

          // Play remote audio
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play().catch(() => {});
        }

        if (data.status === 'rejected' || data.status === 'ended') {
          cleanup();
          setCallState({ status: 'ended', remoteUserId: null, duration: 0, muted: false, speaker: false });
        }
      });

      // Listen for answer ICE candidates
      onSnapshot(collection(db, 'calls', callDocId, 'answerCandidates'), (snap) => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added') {
            pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {});
          }
        });
      });

      // Connection state
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          endCall();
        }
      };
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanup();
      setCallState({ status: 'ended', remoteUserId: null, duration: 0, muted: false, speaker: false });
    }
  }, [cleanup]);

  const endCall = useCallback(() => {
    if (callDocIdRef.current) {
      setDoc(doc(db, 'calls', callDocIdRef.current), { status: 'ended' }, { merge: true }).catch(() => {});
    }
    cleanup();
    setCallState({ status: 'idle', remoteUserId: null, duration: 0, muted: false, speaker: false });
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setCallState(prev => ({ ...prev, muted: !prev.muted }));
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    setCallState(prev => ({ ...prev, speaker: !prev.speaker }));
  }, []);

  // Listen for incoming calls
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // We'll poll for incoming calls using onSnapshot on a specific doc pattern
    // For simplicity, we listen to calls where receiverId == uid and status == 'ringing'
    // This requires a composite index in Firestore
    const q = collection(db, 'calls');
    
    // Instead, we use a user-specific document for call signaling
    const unsub = onSnapshot(doc(db, 'callSignals', uid), async (snap) => {
      const data = snap.data();
      if (!data || data.status !== 'ringing') return;
      if (callState.status !== 'idle') return;

      setCallState(prev => ({
        ...prev,
        status: 'incoming',
        remoteUserId: data.callerId,
      }));
      callDocIdRef.current = data.callDocId;
    });

    return unsub;
  }, [callState.status]);

  const answerCall = useCallback(async () => {
    const callDocId = callDocIdRef.current;
    if (!callDocId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      pc.ontrack = (e) => e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          addDoc(collection(db, 'calls', callDocId, 'answerCandidates'), e.candidate.toJSON()).catch(() => {});
        }
      };

      const callDoc = await (await import('firebase/firestore')).getDoc(doc(db, 'calls', callDocId));
      const callData = callDoc.data();
      if (!callData?.offer) return;

      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await setDoc(doc(db, 'calls', callDocId), {
        answer: { type: answer.type, sdp: answer.sdp },
        status: 'connected',
      }, { merge: true });

      // Add offer candidates
      const offerCandidates = await getDocs(collection(db, 'calls', callDocId, 'offerCandidates'));
      offerCandidates.forEach(d => {
        pc.addIceCandidate(new RTCIceCandidate(d.data())).catch(() => {});
      });

      setCallState(prev => ({ ...prev, status: 'connected' }));
      durationIntervalRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play().catch(() => {});
    } catch (err) {
      console.error('Failed to answer call:', err);
      endCall();
    }
  }, [endCall]);

  const rejectCall = useCallback(() => {
    if (callDocIdRef.current) {
      setDoc(doc(db, 'calls', callDocIdRef.current), { status: 'rejected' }, { merge: true }).catch(() => {});
    }
    cleanup();
    setCallState({ status: 'idle', remoteUserId: null, duration: 0, muted: false, speaker: false });
  }, [cleanup]);

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
