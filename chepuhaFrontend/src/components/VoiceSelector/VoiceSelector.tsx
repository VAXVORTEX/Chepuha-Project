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
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onChange, onPlay, onStop, onPause, onResume, isPlaying, isPaused, isLoading, isReady }) => {
    const { language } = useLanguage();
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
                >
                    <span>{selectedOption.name}</span>
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
                    className={styles.playBtn} 
                    onClick={(isPlaying || isPaused) ? onStop : onPlay}
                    disabled={isLoading || (!isReady && !isPlaying && !isPaused)}
                    title={(isPlaying || isPaused) ? "Остановить полностью" : "Начать озвучку"}
                >
                    {isLoading ? '⏳' : (isPlaying || isPaused) ? '⏹️' : '🔊'}
                </button>
                <button 
                    className={styles.playBtn} 
                    onClick={isPlaying ? onPause : onResume}
                    disabled={isLoading || (!isPlaying && !isPaused)}
                    title={isPlaying ? "Пауза" : "Возобновить"}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
            </div>
        </div>
    );
};

export default VoiceSelector;
