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
    loadingProgress: number;
}

const TTSContext = createContext<TTSContextProps | undefined>(undefined);

const CHUNK_MAX_LENGTH = 1100;

function splitTextIntoChunks(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > CHUNK_MAX_LENGTH) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
}

export const TTSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentVoice, setCurrentVoice] = useState('spongebob');
    
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const blobCache = React.useRef(new Map<string, string>());
    const preloadPromises = React.useRef(new Map<string, Promise<void>>());
    const [cachedKeys, setCachedKeys] = useState<Set<string>>(new Set());
    
    const playAbortControllerRef = React.useRef<AbortController | null>(null);
    const currentPlayIdRef = React.useRef<number>(0);
    const stopPlaybackRef = React.useRef<(() => void) | null>(null);

    const stopTTS = useCallback(() => {
        currentPlayIdRef.current = 0;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (playAbortControllerRef.current) {
            playAbortControllerRef.current.abort();
            playAbortControllerRef.current = null;
        }
        if (stopPlaybackRef.current) {
            stopPlaybackRef.current();
            stopPlaybackRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
    }, []);

    const preloadTTS = useCallback(async (text: string, voice?: string, signal?: AbortSignal) => {
        if (!text) return;
        const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/!/g, '!!!');
        if (!cleanText.trim()) return;

        const targetVoice = voice || currentVoice;
        const chunks = splitTextIntoChunks(cleanText);
        let loadedChunks = 0;
        setLoadingProgress(0);

        let currentFake = 0;
        const fakeProgressInterval = setInterval(() => {
            currentFake += (95 - currentFake) * 0.05; 
            setLoadingProgress(Math.round(currentFake));
        }, 300);

        for (const chunk of chunks) {
            if (signal?.aborted) break;
            const cacheKey = `${chunk}_${targetVoice}`;
            
            if (blobCache.current.has(cacheKey)) {
                loadedChunks++;
                setLoadingProgress(Math.round((loadedChunks / chunks.length) * 100));
                continue;
            }
            if (preloadPromises.current.has(cacheKey)) {
                await preloadPromises.current.get(cacheKey);
                loadedChunks++;
                setLoadingProgress(Math.round((loadedChunks / chunks.length) * 100));
                continue;
            }

            const promise = (async () => {
                const finalText = prepareTextForTTS(chunk);
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
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
                            return;
                        }
                        if (response.status >= 500 && attempt < 2) {
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                    } catch (e: any) {
                        if (e.name === 'AbortError') return;
                        if (attempt < 2) {
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                    }
                }
            })();
            
            preloadPromises.current.set(cacheKey, promise);
            await promise;
            preloadPromises.current.delete(cacheKey);
            loadedChunks++;
            currentFake = Math.max(currentFake, Math.round((loadedChunks / chunks.length) * 100));
            setLoadingProgress(Math.round(currentFake));
        }
        
        clearInterval(fakeProgressInterval);
        setLoadingProgress(100);
    }, [currentVoice]);

    const checkAudioReady = useCallback((text: string, voice?: string) => {
        if (!text) return false;
        const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/!/g, '!!!');
        const targetVoice = voice || currentVoice;
        const chunks = splitTextIntoChunks(cleanText);
        if (chunks.length === 0) return false;
        
        return chunks.every(chunk => {
            const cacheKey = `${chunk}_${targetVoice}`;
            return cachedKeys.has(cacheKey) || blobCache.current.has(cacheKey);
        });
    }, [currentVoice, cachedKeys]);

    const playTTS = useCallback(async (text: string, voice?: string) => {
        if (isPlaying) stopTTS();
        
        if (playAbortControllerRef.current) {
            playAbortControllerRef.current.abort();
            playAbortControllerRef.current = null;
        }

        const playId = Date.now() + Math.random();
        currentPlayIdRef.current = playId;
        
        if (!text) return;
        const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/!/g, '!!!');
        if (!cleanText.trim()) return;
        
        const targetVoice = voice || currentVoice;
        const chunks = splitTextIntoChunks(cleanText);
        
        playAbortControllerRef.current = new AbortController();

        try {
            setIsPlaying(true);
            setIsPaused(false);
            
            for (let i = 0; i < chunks.length; i++) {
                if (currentPlayIdRef.current !== playId) break;
                
                const chunk = chunks[i];
                const cacheKey = `${chunk}_${targetVoice}`;
                
                let url = blobCache.current.get(cacheKey);

                if (!url) {
                    if (preloadPromises.current.has(cacheKey)) {
                        setIsLoading(true);
                        await preloadPromises.current.get(cacheKey);
                        url = blobCache.current.get(cacheKey);
                    }
                }

                if (!url) {
                    setIsLoading(true);
                    let finalText = prepareTextForTTS(chunk);

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
                
                if (currentPlayIdRef.current !== playId) return;
                setIsLoading(false);
                
                await new Promise<void>((resolve, reject) => {
                    if (currentPlayIdRef.current !== playId) return resolve();
                    
                    stopPlaybackRef.current = resolve;
                    
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }

                    audioRef.current = new Audio(url!);
                    audioRef.current.onplay = () => {
                        if (currentPlayIdRef.current !== playId) {
                            audioRef.current?.pause();
                            return resolve();
                        }
                    };
                    audioRef.current.onended = () => {
                        stopPlaybackRef.current = null;
                        resolve();
                    };
                    audioRef.current.onerror = (e) => {
                        stopPlaybackRef.current = null;
                        reject(e);
                    };
                    audioRef.current.play().catch(e => {
                        stopPlaybackRef.current = null;
                        reject(e);
                    });
                });
            }
        } catch (e: any) {
            if (e.name !== 'AbortError' && currentPlayIdRef.current === playId) {
                console.error('Failed to play TTS:', e);
            }
        } finally {
            if (currentPlayIdRef.current === playId) {
                setIsPlaying(false);
                setIsPaused(false);
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
            loadingProgress,
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
