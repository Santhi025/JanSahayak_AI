import { useState, useEffect, useRef, useCallback } from 'react';

export type RecognitionState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface UseVoiceRecognitionOptions {
  lang: string;
  onAutoSubmit: (transcript: string) => void; // kept for API compatibility but no longer called automatically
  silenceTimeoutMs?: number; // kept for API compatibility but ignored
}

export function useVoiceRecognition({ lang, onAutoSubmit }: UseVoiceRecognitionOptions) {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('IDLE');
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  // Accumulated finalized text across multiple recognition segments
  const finalizedTextRef = useRef<string>('');

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore abort errors if already stopped
      }
      recognitionRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    cleanupRecognition();
    finalizedTextRef.current = '';
    setRecognitionState(prev => prev === 'LISTENING' ? 'IDLE' : prev);
  }, [cleanupRecognition]);

  const startListening = useCallback(() => {
    if (recognitionState === 'PROCESSING') return;

    // Interrupt any playing TTS when user starts speaking
    import('@/lib/voice-manager').then(({ voiceManager }) => {
      voiceManager?.stop();
    });

    cleanupRecognition();
    finalizedTextRef.current = '';
    setTranscript('');

    if (typeof window === 'undefined') return;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setRecognitionState('LISTENING');
    };

    recognition.onresult = (event: any) => {
      let interimText = '';

      // Process from resultIndex to pick up only new results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          // Append finalized segment permanently
          finalizedTextRef.current += result[0].transcript + ' ';
        } else {
          // Collect interim (in-progress) text
          interimText += result[0].transcript;
        }
      }

      // Show finalized + current interim together in the input
      setTranscript((finalizedTextRef.current + interimText).trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        stopListening();
      }
    };

    recognition.onend = () => {
      // Auto-restart to keep listening continuously until user explicitly stops
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Recognition was stopped intentionally — just mark idle
          setRecognitionState(prev => prev === 'LISTENING' ? 'IDLE' : prev);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start SpeechRecognition:', e);
      stopListening();
    }
  }, [lang, recognitionState, cleanupRecognition, stopListening]);

  useEffect(() => {
    return cleanupRecognition;
  }, [cleanupRecognition]);

  return {
    recognitionState,
    setRecognitionState,
    transcript,
    setTranscript,
    startListening,
    stopListening,
  };
}
