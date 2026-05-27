'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sharedApi } from '@/api/shared';
import { useSocket } from '@/hooks/useSocket';
import { Paperclip, Send, X, Play, Pause, File as FileIcon, Mic, Square, Trash2, Loader2 } from 'lucide-react';
import { getAuthToken } from '@/utils/helpers';

interface TicketMessage {
  id: string;
  message: string;
  createdAt: string;
  senderId: string;
  senderRole: string;
}

interface MediaPreview {
  url: string;
  type: 'image' | 'video';
}

interface AudioState {
  blob: Blob;
  url: string;
}

const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    
    const setAudioTime = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      if (audio) audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (value / 100) * duration;
      setProgress(value);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-background/50 border border-border p-2 rounded-full min-w-[220px] max-w-full">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlay} 
        className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 hover:bg-primary/90 transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={isNaN(progress) ? 0 : progress}
        onChange={handleSeek}
        className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
};

export const TicketChat = ({ ticketId, isAdmin = false }: { ticketId: string, isAdmin?: boolean }) => {
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaPreview | null>(null);
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedAudio, setRecordedAudio] = useState<AudioState | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const socket = useSocket();
  const queryClient = useQueryClient();

  const { data: messages } = useQuery<TicketMessage[]>({
    queryKey: ['ticketMessages', ticketId],
    queryFn: () => sharedApi.getTicketChatMessages(ticketId)
  });

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        console.error('Failed to parse auth token', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinTicket', ticketId);
    socket.on('ticketMessage', (newMessage: TicketMessage) => {
      queryClient.setQueryData<TicketMessage[]>(['ticketMessages', ticketId], (old) => {
        if (old?.some(m => m.id === newMessage.id)) return old;
        return [newMessage, ...(old || [])];
      });
    });
    return () => { socket.off('ticketMessage'); };
  }, [socket, ticketId, queryClient]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedAudio) URL.revokeObjectURL(recordedAudio.url);
    };
  }, [recordedAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedAudio({ blob, url });
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const discardAudio = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !file && !recordedAudio) || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (message.trim()) formData.append('message', message);
      
      if (recordedAudio) {
        const mimeType = recordedAudio.blob.type || 'audio/webm';
        const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const audioFile = new File([recordedAudio.blob], `audio_message.${ext}`, { type: mimeType });
        formData.append('file', audioFile);
      } else if (file) {
        formData.append('file', file);
      }

      const responseMessage = await sharedApi.sendTicketChatMessage(ticketId, formData);
      
      queryClient.setQueryData<TicketMessage[]>(['ticketMessages', ticketId], (old) => {
        const filtered = old?.filter(m => m.id !== responseMessage.id) || [];
        return [responseMessage, ...filtered];
      });
      
      setMessage('');
      setFile(null);
      setRecordedAudio(null);
      setRecordingTime(0);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMediaType = (rawUrl: string): 'image' | 'video' | 'audio' | 'file' => {
    try {
      const urlWithoutQuery = rawUrl.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase() || '';

      if (rawUrl.includes('audio_message')) return 'audio';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
      if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'weba'].includes(extension)) return 'audio';
      if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';

      return 'file';
    } catch {
      return 'file';
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderMessageContent = (text: string) => {
    const attachmentRegex = /\[Attachment\]\((.*?)\)/;
    const match = text.match(attachmentRegex);
    
    if (match) {
      const url = match[1];
      const cleanText = text.replace(attachmentRegex, '').trim();
      const mediaType = getMediaType(url);
      
      return (
        <div className="flex flex-col gap-3">
          {cleanText && <span>{cleanText}</span>}
          
          {mediaType === 'image' && (
            <div 
              className="relative w-48 h-48 cursor-pointer rounded-lg overflow-hidden border border-border/50 hover:opacity-90 transition-opacity bg-muted"
              onClick={() => setPreviewMedia({ url, type: 'image' })}
            >
              <img src={url} alt="Attachment" className="object-cover w-full h-full" />
            </div>
          )}

          {mediaType === 'video' && (
            <div 
              className="relative w-48 h-48 cursor-pointer rounded-lg overflow-hidden border border-border/50 bg-black flex items-center justify-center hover:opacity-90 transition-opacity"
              onClick={() => setPreviewMedia({ url, type: 'video' })}
            >
              <video src={url} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/90 text-white p-3 rounded-full backdrop-blur-sm shadow-lg">
                  <Play size={20} className="ml-1" />
                </div>
              </div>
            </div>
          )}

          {mediaType === 'audio' && (
            <div className="pt-1">
              <AudioPlayer src={url} />
            </div>
          )}

          {mediaType === 'file' && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs bg-black/10 dark:bg-white/10 px-3 py-2 rounded-md hover:opacity-80 transition-opacity w-fit">
              <FileIcon size={14} /> View Attachment
            </a>
          )}
        </div>
      );
    }
    return <span className="whitespace-pre-wrap">{text}</span>;
  };

  return (
    <>
      <div className="flex flex-col h-[500px] border border-border rounded-xl bg-card overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse">
          {messages?.map((m: TicketMessage) => {
            const isMe = currentUserId 
                ? m.senderId === currentUserId 
                : (isAdmin ? m.senderRole === 'ADMIN' : m.senderRole !== 'ADMIN');
            
            return (
              <div key={m.id} className={`p-3 rounded-2xl max-w-[80%] ${isMe ? 'bg-primary text-primary-foreground self-end rounded-br-sm' : 'bg-secondary text-secondary-foreground self-start rounded-bl-sm'}`}>
                <div className="text-sm">
                  {renderMessageContent(m.message)}
                </div>
              </div>
            );
          })}
        </div>

        {file && !recordedAudio && (
          <div className="px-4 py-3 bg-secondary/80 backdrop-blur-sm border-t border-border flex items-center justify-between text-sm absolute bottom-[73px] left-0 right-0 z-10">
            <span className="truncate font-medium flex items-center gap-2">
              <Paperclip size={14} /> {file.name}
            </span>
            <button onClick={() => setFile(null)} disabled={isUploading} className="hover:text-destructive transition-colors bg-background/50 p-1 rounded-full disabled:opacity-50"><X size={16} /></button>
          </div>
        )}

        <div className="p-4 border-t border-border flex items-center gap-2 bg-card relative z-20">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-destructive/10 text-destructive px-5 py-2.5 rounded-full border border-destructive/20">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-2.5 h-2.5 bg-destructive rounded-full" />
                <span className="font-medium text-sm">{formatTime(recordingTime)}</span>
              </div>
              <button onClick={stopRecording} className="text-destructive hover:scale-110 transition-transform">
                <Square size={18} fill="currentColor" />
              </button>
            </div>
          ) : recordedAudio ? (
            <div className="flex-1 flex items-center gap-2">
              <button onClick={discardAudio} disabled={isUploading} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-muted disabled:opacity-50">
                <Trash2 size={20} />
              </button>
              <div className="flex-1">
                <AudioPlayer src={recordedAudio.url} />
              </div>
              <button onClick={sendMessage} disabled={isUploading} className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[44px] min-h-[44px]">
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} 
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                disabled={isUploading}
              />
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted shrink-0 disabled:opacity-50">
                <Paperclip size={20} />
              </button>
              <input 
                ref={inputRef}
                className="flex-1 p-3 bg-background border border-border rounded-full outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm px-5 disabled:opacity-50"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isUploading}
              />
              {message.trim() || file ? (
                <button onClick={sendMessage} disabled={isUploading} className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm shrink-0 disabled:opacity-70 flex items-center justify-center min-w-[44px] min-h-[44px]">
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              ) : (
                <button onClick={startRecording} disabled={isUploading} className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm shrink-0 disabled:opacity-70 flex items-center justify-center min-w-[44px] min-h-[44px]">
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {previewMedia && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewMedia(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex justify-center items-center" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 md:-right-12 md:top-0 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              onClick={() => setPreviewMedia(null)}
            >
              <X size={24} />
            </button>
            
            {previewMedia.type === 'image' ? (
              <img 
                src={previewMedia.url} 
                alt="Fullscreen Preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" 
              />
            ) : (
              <video 
                src={previewMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] rounded-md shadow-2xl outline-none" 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};