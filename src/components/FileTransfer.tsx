import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Film, Download, X, Check, AlertTriangle, Loader2 } from 'lucide-react';

export interface FileTransferRequest {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  senderId: string;
  senderName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'uploading' | 'completed' | 'failed';
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  return FileText;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileTransferIncomingProps {
  request: FileTransferRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function FileTransferIncoming({ request, onAccept, onReject }: FileTransferIncomingProps) {
  const Icon = getFileIcon(request.fileType);

  return (
    <motion.div
      className="max-w-[85%] rounded-2xl bg-muted p-3 sm:max-w-[75%]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{request.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(request.fileSize)}</p>
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onAccept(request.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2 text-xs font-semibold text-primary-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-3.5 w-3.5" /> Accept
          </motion.button>
          <motion.button
            onClick={() => onReject(request.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2 text-xs font-semibold text-destructive-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </motion.button>
        </div>
      )}

      {request.status === 'uploading' && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Downloading... {request.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${request.progress}%` }}
            />
          </div>
        </div>
      )}

      {request.status === 'completed' && (
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <Check className="h-3.5 w-3.5" /> File received successfully
        </div>
      )}

      {request.status === 'rejected' && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <X className="h-3.5 w-3.5" /> File rejected
        </div>
      )}

      {request.status === 'failed' && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" /> Upload failed
        </div>
      )}
    </motion.div>
  );
}

interface FileTransferOutgoingProps {
  request: FileTransferRequest;
}

export function FileTransferOutgoing({ request }: FileTransferOutgoingProps) {
  const Icon = getFileIcon(request.fileType);

  return (
    <motion.div
      className="max-w-[85%] rounded-2xl gradient-primary p-3 sm:max-w-[75%]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary-foreground truncate">{request.fileName}</p>
          <p className="text-xs text-primary-foreground/70">{formatFileSize(request.fileSize)}</p>
        </div>
      </div>

      {request.status === 'pending' && (
        <p className="text-xs text-primary-foreground/70">Waiting for acceptance...</p>
      )}

      {request.status === 'uploading' && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
            <span className="text-xs text-primary-foreground/70">Uploading... {request.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary-foreground rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${request.progress}%` }}
            />
          </div>
        </div>
      )}

      {request.status === 'completed' && (
        <p className="text-xs text-primary-foreground/70 flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" /> File sent successfully
        </p>
      )}

      {request.status === 'rejected' && (
        <p className="text-xs text-primary-foreground/70 flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" /> File rejected by recipient
        </p>
      )}

      {request.status === 'failed' && (
        <p className="text-xs text-primary-foreground/70 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> Upload failed – network issue
        </p>
      )}
    </motion.div>
  );
}

interface FileSendButtonProps {
  onSendFile: (file: File) => void;
}

export function useFileTransfer() {
  const [transfers, setTransfers] = useState<FileTransferRequest[]>([]);

  const sendFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      const req: FileTransferRequest = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        senderId: 'me',
        senderName: 'You',
        status: 'failed',
        progress: 0,
      };
      setTransfers(prev => [...prev, req]);
      return;
    }

    const req: FileTransferRequest = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      senderId: 'me',
      senderName: 'You',
      status: 'pending',
      progress: 0,
    };
    setTransfers(prev => [...prev, req]);

    // Simulate acceptance after 2s, then uploading
    setTimeout(() => {
      setTransfers(prev => prev.map(t => t.id === req.id ? { ...t, status: 'accepted' } : t));
      // Start simulated upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTransfers(prev => prev.map(t => t.id === req.id ? { ...t, status: 'completed', progress: 100 } : t));
        } else {
          setTransfers(prev => prev.map(t => t.id === req.id ? { ...t, status: 'uploading', progress: Math.min(99, Math.round(progress)) } : t));
        }
      }, 500);
    }, 2000);
  }, []);

  const receiveFile = useCallback((fileName: string, fileSize: number, fileType: string, senderName: string) => {
    const req: FileTransferRequest = {
      id: Date.now().toString(),
      fileName,
      fileSize,
      fileType,
      senderId: 'other',
      senderName,
      status: 'pending',
      progress: 0,
    };
    setTransfers(prev => [...prev, req]);
    return req.id;
  }, []);

  const acceptTransfer = useCallback((id: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'uploading', progress: 0 } : t));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'completed', progress: 100 } : t));
      } else {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'uploading', progress: Math.min(99, Math.round(progress)) } : t));
      }
    }, 500);
  }, []);

  const rejectTransfer = useCallback((id: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  }, []);

  return { transfers, sendFile, receiveFile, acceptTransfer, rejectTransfer };
}
