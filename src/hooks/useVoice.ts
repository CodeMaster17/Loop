// Thin hook around expo-speech-recognition: exposes listening state, the live
// transcript, a "final" signal, and start/stop controls. UI decides what to do.
import { useCallback, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export interface UseVoice {
  listening: boolean;
  transcript: string;
  setTranscript: (t: string) => void;
  error: string | null;
  setError: (e: string | null) => void;
  /** Set once when a final result lands; consumer applies it then calls clearFinal(). */
  finalTranscript: string | null;
  clearFinal: () => void;
  start: () => Promise<void>;
  stop: () => void;
  abort: () => void;
}

export function useVoice(): UseVoice {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [finalTranscript, setFinalTranscript] = useState<string | null>(null);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results?.[0]?.transcript ?? '';
    if (t) { setTranscript(t); setError(null); }
    if (e.isFinal && t) setFinalTranscript(t);
  });
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    switch (e.error) {
      case 'not-allowed':
      case 'service-not-allowed':
        setError('Mic blocked — type your change instead.');
        break;
      case 'no-speech':
        setError("Didn't catch that — tap the mic to try again.");
        break;
      case 'language-not-supported':
        setError('That language isn’t supported here — type your change.');
        break;
      default:
        setError('Voice unavailable — type your change below.');
    }
  });

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    setFinalTranscript(null);
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setError('Allow the microphone to use voice, or type below.');
        return;
      }
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: false });
    } catch {
      setError('Voice not available here — type your change below.');
    }
  }, []);

  const stop = useCallback(() => { try { ExpoSpeechRecognitionModule.stop(); } catch { /* no-op */ } }, []);
  const abort = useCallback(() => { try { ExpoSpeechRecognitionModule.abort(); } catch { /* no-op */ } }, []);
  const clearFinal = useCallback(() => setFinalTranscript(null), []);

  return { listening, transcript, setTranscript, error, setError, finalTranscript, clearFinal, start, stop, abort };
}
