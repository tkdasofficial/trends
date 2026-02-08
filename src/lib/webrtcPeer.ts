import { doc, setDoc, onSnapshot, deleteDoc, collection, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type D2DMessageType =
  | 'chat'
  | 'file-request'
  | 'file-accept'
  | 'file-reject'
  | 'file-chunk-meta'
  | 'file-complete'
  | 'typing'
  | 'ping';

export interface D2DMessage {
  type: D2DMessageType;
  id: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface FileTransferMeta {
  requestId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
}

type MessageHandler = (msg: D2DMessage) => void;
type BinaryHandler = (data: ArrayBuffer, meta: { requestId: string; chunkIndex: number }) => void;
type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'failed') => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const CHUNK_SIZE = 16384; // 16KB chunks for DataChannel

// ─── WebRTC Peer Manager ──────────────────────────────────────────────────────

export class WebRTCPeer {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signalDocId: string | null = null;
  private unsubSignal: (() => void) | null = null;
  private unsubCandidates: (() => void) | null = null;

  public peerId: string;
  public onMessage: MessageHandler = () => {};
  public onBinaryData: BinaryHandler = () => {};
  public onStatusChange: StatusHandler = () => {};
  public onRemoteStream: (stream: MediaStream) => void = () => {};

  private _status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed' = 'idle';
  private pendingBinaryMeta: { requestId: string; chunkIndex: number } | null = null;

  constructor(peerId: string) {
    this.peerId = peerId;
  }

  get status() { return this._status; }

  private setStatus(s: typeof this._status) {
    this._status = s;
    if (s !== 'idle') this.onStatusChange(s as any);
  }

  // ── Initiate Connection (Caller) ──────────────────────────────────────────

  async connect(withAudio = false): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    this.setStatus('connecting');

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.pc = pc;

    // Create DataChannel
    const dc = pc.createDataChannel('d2d', { ordered: true });
    this.setupDataChannel(dc);

    // Audio (if calling)
    if (withAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localStream = stream;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
      } catch (err) {
        console.error('Mic access failed:', err);
      }
    }

    // Remote stream
    const remoteStream = new MediaStream();
    this.remoteStream = remoteStream;
    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
      this.onRemoteStream(remoteStream);
    };

    // Signaling doc
    const signalId = [uid, this.peerId].sort().join('_') + '_' + Date.now();
    this.signalDocId = signalId;

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        addDoc(collection(db, 'signals', signalId, 'offerCandidates'), e.candidate.toJSON()).catch(() => {});
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await setDoc(doc(db, 'signals', signalId), {
      offer: { type: offer.type, sdp: offer.sdp },
      callerId: uid,
      receiverId: this.peerId,
      status: 'pending',
      withAudio,
      createdAt: new Date().toISOString(),
    });

    // Also write to the receiver's inbox for discovery
    await setDoc(doc(db, 'peerInbox', this.peerId), {
      signalId,
      callerId: uid,
      withAudio,
      timestamp: new Date().toISOString(),
    });

    // Listen for answer
    this.unsubSignal = onSnapshot(doc(db, 'signals', signalId), async (snap) => {
      const data = snap.data();
      if (!data) return;

      if (data.answer && pc.signalingState !== 'closed' && !pc.currentRemoteDescription) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error('Failed to set remote description:', err);
        }
      }

      if (data.status === 'rejected') {
        this.cleanup();
        this.setStatus('failed');
      }
    });

    // Listen for answer ICE candidates
    this.unsubCandidates = onSnapshot(collection(db, 'signals', signalId, 'answerCandidates'), (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added' && pc.signalingState !== 'closed') {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {});
        }
      });
    });

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.setStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.setStatus('disconnected');
      }
    };
  }

  // ── Answer Connection (Receiver) ──────────────────────────────────────────

  async answer(signalId: string): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    this.setStatus('connecting');
    this.signalDocId = signalId;

    const signalDoc = await getDoc(doc(db, 'signals', signalId));
    const signalData = signalDoc.data();
    if (!signalData?.offer) throw new Error('No offer found');

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.pc = pc;

    // Receive DataChannel
    pc.ondatachannel = (e) => {
      this.setupDataChannel(e.channel);
    };

    // Audio if requested
    if (signalData.withAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localStream = stream;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
      } catch (err) {
        console.error('Mic access failed:', err);
      }
    }

    // Remote stream
    const remoteStream = new MediaStream();
    this.remoteStream = remoteStream;
    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
      this.onRemoteStream(remoteStream);
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        addDoc(collection(db, 'signals', signalId, 'answerCandidates'), e.candidate.toJSON()).catch(() => {});
      }
    };

    // Set offer and create answer
    await pc.setRemoteDescription(new RTCSessionDescription(signalData.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await setDoc(doc(db, 'signals', signalId), {
      answer: { type: answer.type, sdp: answer.sdp },
      status: 'connected',
    }, { merge: true });

    // Add existing offer candidates
    const offerCandidates = await getDocs(collection(db, 'signals', signalId, 'offerCandidates'));
    offerCandidates.forEach(d => {
      pc.addIceCandidate(new RTCIceCandidate(d.data())).catch(() => {});
    });

    // Listen for new offer candidates
    this.unsubCandidates = onSnapshot(collection(db, 'signals', signalId, 'offerCandidates'), (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added' && pc.signalingState !== 'closed') {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {});
        }
      });
    });

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.setStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.setStatus('disconnected');
      }
    };
  }

  // ── DataChannel Setup ─────────────────────────────────────────────────────

  private setupDataChannel(dc: RTCDataChannel) {
    this.dataChannel = dc;
    dc.binaryType = 'arraybuffer';

    dc.onopen = () => {
      console.log('DataChannel open with', this.peerId);
      this.setStatus('connected');
    };

    dc.onclose = () => {
      console.log('DataChannel closed');
      this.setStatus('disconnected');
    };

    dc.onmessage = (e) => {
      if (typeof e.data === 'string') {
        try {
          const msg = JSON.parse(e.data) as D2DMessage;
          // If it's a file-chunk-meta, store meta for next binary message
          if (msg.type === 'file-chunk-meta') {
            this.pendingBinaryMeta = {
              requestId: msg.payload.requestId,
              chunkIndex: msg.payload.chunkIndex,
            };
          } else {
            this.onMessage(msg);
          }
        } catch (err) {
          console.error('Failed to parse DataChannel message:', err);
        }
      } else if (e.data instanceof ArrayBuffer) {
        // Binary file chunk
        if (this.pendingBinaryMeta) {
          this.onBinaryData(e.data, this.pendingBinaryMeta);
          this.pendingBinaryMeta = null;
        }
      }
    };

    dc.onerror = (err) => {
      console.error('DataChannel error:', err);
    };
  }

  // ── Send Methods ──────────────────────────────────────────────────────────

  sendMessage(msg: D2DMessage) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(msg));
    } else {
      console.warn('DataChannel not open, cannot send message');
    }
  }

  sendBinary(data: ArrayBuffer, requestId: string, chunkIndex: number) {
    if (this.dataChannel?.readyState !== 'open') return;
    // Send meta first (so receiver knows what the binary is)
    const meta: D2DMessage = {
      type: 'file-chunk-meta',
      id: `chunk_${requestId}_${chunkIndex}`,
      payload: { requestId, chunkIndex },
      timestamp: new Date().toISOString(),
    };
    this.dataChannel.send(JSON.stringify(meta));
    this.dataChannel.send(data);
  }

  // Send a file in chunks
  async sendFile(file: File, requestId: string, onProgress?: (pct: number) => void): Promise<void> {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const reader = file.stream().getReader();
    let chunkIndex = 0;
    let sentBytes = 0;

    const sendNextChunks = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Split ReadableStream chunks into CHUNK_SIZE pieces
        let offset = 0;
        while (offset < value.byteLength) {
          const end = Math.min(offset + CHUNK_SIZE, value.byteLength);
          const chunk = value.slice(offset, end);
          
          // Wait for buffer to drain if needed
          while (this.dataChannel && this.dataChannel.bufferedAmount > 1024 * 1024) {
            await new Promise(r => setTimeout(r, 50));
          }

          this.sendBinary(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength), requestId, chunkIndex);
          chunkIndex++;
          sentBytes += chunk.byteLength;
          offset = end;

          if (onProgress) {
            onProgress(Math.min(99, Math.round((sentBytes / file.size) * 100)));
          }
        }
      }
    };

    await sendNextChunks();

    // Send completion message
    this.sendMessage({
      type: 'file-complete' as D2DMessageType,
      id: `complete_${requestId}`,
      payload: { requestId, totalChunks: chunkIndex },
      timestamp: new Date().toISOString(),
    });

    if (onProgress) onProgress(100);
  }

  // ── Audio Controls ────────────────────────────────────────────────────────

  toggleMute(): boolean {
    if (this.localStream) {
      const track = this.localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        return !track.enabled; // returns true if muted
      }
    }
    return false;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  cleanup() {
    this.dataChannel?.close();
    this.dataChannel = null;
    this.pc?.close();
    this.pc = null;
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.remoteStream = null;
    this.unsubSignal?.();
    this.unsubSignal = null;
    this.unsubCandidates?.();
    this.unsubCandidates = null;

    // Clean up signaling doc
    if (this.signalDocId) {
      deleteDoc(doc(db, 'signals', this.signalDocId)).catch(() => {});
    }
    // Clean up inbox
    if (this.peerId) {
      deleteDoc(doc(db, 'peerInbox', this.peerId)).catch(() => {});
    }

    this.signalDocId = null;
    this._status = 'idle';
  }

  isConnected(): boolean {
    return this.dataChannel?.readyState === 'open';
  }

  reject(signalId: string) {
    setDoc(doc(db, 'signals', signalId), { status: 'rejected' }, { merge: true }).catch(() => {});
    const uid = auth.currentUser?.uid;
    if (uid) deleteDoc(doc(db, 'peerInbox', uid)).catch(() => {});
  }
}

// ─── Singleton Peer Manager ───────────────────────────────────────────────────

const activePeers = new Map<string, WebRTCPeer>();

export function getPeer(peerId: string): WebRTCPeer {
  let peer = activePeers.get(peerId);
  if (!peer || peer.status === 'failed' || peer.status === 'disconnected') {
    if (peer) peer.cleanup();
    peer = new WebRTCPeer(peerId);
    activePeers.set(peerId, peer);
  }
  return peer;
}

export function getActivePeer(peerId: string): WebRTCPeer | undefined {
  return activePeers.get(peerId);
}

export function removePeer(peerId: string) {
  const peer = activePeers.get(peerId);
  if (peer) {
    peer.cleanup();
    activePeers.delete(peerId);
  }
}

export function cleanupAllPeers() {
  activePeers.forEach(p => p.cleanup());
  activePeers.clear();
}
