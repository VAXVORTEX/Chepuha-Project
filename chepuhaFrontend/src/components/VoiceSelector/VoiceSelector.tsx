import React, { useState, useRef, useEffect } from 'react';
import styles from './VoiceSelector.module.scss';
import { useLanguage } from '../../contexts/LanguageContext';

export interface VoiceOption {
    id: string;
    name: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
    { id: 'spongebob', name: 'Губка Боб' },
    { id: 'optimus', name: 'Оптімус Прайм' },
    { id: 'mita', name: 'Мита (MiSide)' },
    { id: 'silverhand', name: 'Джонні Сільверхенд' },
    { id: 'Zelenskyi', name: 'Зеленський' }
];

interface VoiceSelectorProps {
    selectedVoice: string;
    onChange: (voiceId: string) => void;
    onPlay: () => void;
    onStop: () => void;
    onPause: () => void;
    onResume: () => void;
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
    isReady?: boolean;
    loadingProgress?: number;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onChange, onPlay, onStop, onPause, onResume, isPlaying, isPaused, isLoading, isReady, loadingProgress = 0 }) => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = AVAILABLE_VOICES.find(v => v.id === selectedVoice) || AVAILABLE_VOICES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.dropdownContainer} ref={dropdownRef}>
                <div 
                    key={selectedVoice}
                    className={`${styles.select} ${isOpen ? styles.selectOpen : ''} ${(!isReady && isReady !== undefined) || isLoading ? styles.loading : ''} ${isReady ? styles.ready : ''}`} 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ '--progress': `${!isReady ? loadingProgress : 100}%` } as React.CSSProperties}
                >
                    <span>{(!isReady && isLoading) ? `${t('LOADING' as any)} ${loadingProgress}%` : selectedOption.name}</span>
                </div>
                {isOpen && (
                    <div className={styles.dropdownMenu}>
                        {AVAILABLE_VOICES.map((v) => (
                            <div 
                                key={v.id} 
                                className={`${styles.dropdownItem} ${v.id === selectedVoice ? styles.dropdownItemSelected : ''}`}
                                onClick={() => {
                                    onStop();
                                    onChange(v.id);
                                    setIsOpen(false);
                                }}
                            >
                                {v.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.controls}>
                <button 
                    className={`${styles.playBtn} ${(!isReady || isLoading) && !isPlaying && !isPaused ? styles.disabledBtn : ''}`} 
                    onClick={(isPlaying || isPaused) ? onStop : onPlay}
                    disabled={(!isReady || isLoading) && !isPlaying && !isPaused}
                    title={(isPlaying || isPaused) ? "Остановить полностью" : "Начать озвучку"}
                    style={(!isReady || isLoading) && !isPlaying && !isPaused ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                    {(!isReady || isLoading) && !isPlaying && !isPaused ? '⏳' : (isPlaying || isPaused) ? '⏹️' : '🔊'}
                </button>
                <button 
                    className={styles.playBtn} 
                    onClick={isPlaying ? onPause : onResume}
                    disabled={(!isPlaying && !isPaused)}
                    title={isPlaying ? "Пауза" : "Возобновить"}
                    style={(!isPlaying && !isPaused) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
            </div>
        </div>
    );
};

export default VoiceSelector;
