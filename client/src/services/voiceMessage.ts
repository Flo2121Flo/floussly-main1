import { useState, useRef } from 'react';

interface VoiceMessageState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

export const useVoiceMessage = () => {
  const [state, setState] = useState<VoiceMessageState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob,
          audioUrl,
          duration,
        }));

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState((prev) => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to access microphone',
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadVoiceMessage = async (chatId: string): Promise<string> => {
    if (!state.audioBlob) {
      throw new Error('No audio recording available');
    }

    const formData = new FormData();
    formData.append('audio', state.audioBlob, 'voice-message.webm');
    formData.append('chatId', chatId);

    try {
      const response = await fetch('/api/voice-messages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice message');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to upload voice message',
      }));
      throw error;
    }
  };

  const clearRecording = () => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    });
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    uploadVoiceMessage,
    clearRecording,
  };
}; 