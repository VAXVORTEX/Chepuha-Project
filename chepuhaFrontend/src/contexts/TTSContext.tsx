import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { prepareTextForTTS } from '../utils/groq';

export interface TTSContextProps {
    playTTS: (text: string, voice?: string) => void;
    stopTTS: () => void;
    pauseTTS: () => void;
    resumeTTS: () => void;
    preloadTTS: (text: string, voice?: string, signal?: AbortSignal) => Promise<void>;
    checkAudioReady: (text: string, voice?: string) => boolean;
    isPlaying: boolean;
    isPaused: boolean;
    currentVoice: string;
    setCurrentVoice: (id: string) => void;
    isLoading: boolean;
}

const TTSContext = createContext<TTSContextProps | undefined>(undefined);

export const TTSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentVoice, setCurrentVoice] = useState('spongebob');
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const blobCache = React.useRef(new Map<string, string>());
    const preloadPromises = React.useRef(new Map<string, Promise<void>>());
    const [cachedKeys, setCachedKeys] = useState<Set<string>>(new Set());

    const stopTTS = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    const preloadTTS = useCallback(async (text: string, voice?: string, signal?: AbortSignal) => {
        if (!text) return;
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        if (!cleanText.trim()) return;

        const targetVoice = voice || currentVoice;
        const cacheKey = `${cleanText}_${targetVoice}`;
        
        if (blobCache.current.has(cacheKey)) return;
        if (preloadPromises.current.has(cacheKey)) {
            return preloadPromises.current.get(cacheKey);
        }

        const promise = (async () => {
            try {
                const finalText = await prepareTextForTTS(cleanText);
                
                const response = await fetch(`https://kikk22320-chepuha-tts.hf.space/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: finalText, voice: targetVoice }),
                    signal 
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    blobCache.current.set(cacheKey, url);
                    setCachedKeys(prev => new Set(prev).add(cacheKey));
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.warn('Background TTS preload failed:', e);
                }
            } finally {
                preloadPromises.current.delete(cacheKey);
            }
        })();
        
        preloadPromises.current.set(cacheKey, promise);
        return promise;
    }, [currentVoice]);

    const playAbortControllerRef = useRef<AbortController | null>(null);
    const currentPlayIdRef = useRef<number>(0);

    const checkAudioReady = useCallback((text: string, voice?: string) => {
        const targetVoice = voice || currentVoice;
        let cleanText = preprocessText(text);
        if (cleanText.length > 300) cleanText = cleanText.substring(0, 300);
        const cacheKey = `${cleanText}_${targetVoice}`;
        return blobCache.current.has(cacheKey);
    }, [currentVoice]);

    const playTTS = useCallback(async (text: string, voice?: string) => {
        if (isPlaying) {
            stopTTS();
        }
        
        if (playAbortControllerRef.current) {
            playAbortControllerRef.current.abort();
            playAbortControllerRef.current = null;
        }

        const playId = Date.now() + Math.random();
        currentPlayIdRef.current = playId;
        
        if (!text) return;
        let cleanText = preprocessText(text);
        if (!cleanText.trim()) return;
        
        if (cleanText.length > 300) {
            cleanText = cleanText.substring(0, 300);
        }

        const targetVoice = voice || currentVoice;
        const cacheKey = `${cleanText}_${targetVoice}`;
        
        setIsLoading(true);
        
        try {
            let url = blobCache.current.get(cacheKey);

            if (!url) {
                if (preloadPromises.current.has(cacheKey)) {
                    await preloadPromises.current.get(cacheKey);
                    url = blobCache.current.get(cacheKey);
                }
            }

            if (currentPlayIdRef.current !== playId) return;

            if (!url) {
                let finalText = await prepareTextForTTS(cleanText);
                
                if (currentPlayIdRef.current !== playId) return;

                if (finalText.length > 400) {
                    finalText = finalText.substring(0, 400);
                }

                playAbortControllerRef.current = new AbortController();
                const response = await fetch(`https://kikk22320-chepuha-tts.hf.space/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: finalText, voice: targetVoice }),
                    signal: playAbortControllerRef.current.signal
                });
                
                if (currentPlayIdRef.current !== playId) return;
                
                if (!response.ok) throw new Error('TTS Backend Failed');
                
                const blob = await response.blob();
                url = URL.createObjectURL(blob);
                blobCache.current.set(cacheKey, url);
                setCachedKeys(prev => new Set(prev).add(cacheKey));
            }
            
            if (audioRef.current) {
                audioRef.current.pause();
            }
            
            audioRef.current = new Audio(url);
            audioRef.current.onplay = () => {
                if (currentPlayIdRef.current !== playId) {
                    audioRef.current?.pause();
                    return;
                }
                setIsPlaying(true);
                setIsPaused(false);
                setIsLoading(false);
            };
            audioRef.current.onended = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };
            audioRef.current.play();
            setIsPaused(false);
        } catch (e: any) {
            if (e.name !== 'AbortError' && currentPlayIdRef.current === playId) {
                console.error('Failed to play TTS:', e);
                setIsPlaying(false);
                setIsPaused(false);
                setIsLoading(false);
            }
        } finally {
            if (currentPlayIdRef.current === playId) {
                setIsLoading(false);
            }
        }
    }, [currentVoice, isPlaying, stopTTS]);

    const pauseTTS = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPaused(true);
            setIsPlaying(false);
        }
    }, []);

    const resumeTTS = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            setIsPaused(false);
        }
    }, []);

    // Wake up HF space on mount
    useEffect(() => {
        fetch('https://kikk22320-chepuha-tts.hf.space/').catch(() => {});
    }, []);

    const checkAudioReady = useCallback((text: string, voice?: string) => {
        if (!text) return false;
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const targetVoice = voice || currentVoice;
        const cacheKey = `${cleanText}_${targetVoice}`;
        return cachedKeys.has(cacheKey);
    }, [cachedKeys, currentVoice]);

    return (
        <TTSContext.Provider value={{
            playTTS,
            stopTTS,
            pauseTTS,
            resumeTTS,
            preloadTTS,
            checkAudioReady,
            isPlaying,
            isPaused,
            isLoading,
            currentVoice,
            setCurrentVoice
        }}>
            {children}
        </TTSContext.Provider>
    );
};

export const useTTS = () => {
    const context = useContext(TTSContext);
    if (!context) {
        throw new Error("useTTS must be used within a TTSProvider");
    }
    return context;
};
