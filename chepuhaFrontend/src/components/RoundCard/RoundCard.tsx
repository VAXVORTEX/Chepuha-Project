import React, { useState } from 'react';
import styles from './RoundCard.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Phases } from '../../types/phaseVariant';
import { useLanguage } from '../../contexts/LanguageContext';
import { TranslationKey } from '../../config/i18n';
interface RoundCardProps {
    playerName: string;
    playerColor?: string;
    phase: Phases;
    question?: string;
    playerReady?: number;
    playerTotal?: number;
    onSubmitAnswer?: (answer: string) => void;
    hints?: string[];
}
export const RoundCard = ({
    playerName,
    playerColor,
    phase,
    question = '',
    playerReady = 0,
    playerTotal = 0,
    onSubmitAnswer,
    hints
}: RoundCardProps) => {
    const [answer, setAnswer] = useState('');
    const [showHints, setShowHints] = useState(false);
    const [selectedHints, setSelectedHints] = useState<string[]>([]);
    const { t } = useLanguage();

    React.useEffect(() => {
        if (hints && hints.length > 0) {
            const shuffled = [...hints].sort(() => 0.5 - Math.random());
            setSelectedHints(shuffled.slice(0, 3));
        } else {
            setSelectedHints([]);
        }
    }, [hints]);

    const isWaiting = phase === Phases.Waiting;
    const handleSubmit = () => {
        if (onSubmitAnswer && answer.trim() !== '') {
            onSubmitAnswer(answer);
            setAnswer('');
        }
    };
    return (
        <div className={`${styles.roundCard} ${isWaiting ? styles.waiting : ''}`}>
            <div className={styles.header} style={playerColor ? { backgroundColor: playerColor } : {}}>
                <h2 className={styles.playerName}>{playerName}</h2>
            </div>
            <div className={styles.body}>
                {isWaiting ? (
                    <div className={styles.waitingContent}>
                        <h3 className={styles.successText}>{t('ANSWER_SAVED')}</h3>
                        <div className={styles.counter}>
                            {t('WAITING_FOR')}: <span>{playerReady} / {playerTotal}</span> {t('PLAYERS')}
                        </div>
                    </div>
                ) : (
                    <div className={styles.activeContent}>
                        <h3 className={styles.question}>{question ? t(question as TranslationKey) : ''}</h3>
                        <Input
                            value={answer}
                            onChange={setAnswer}
                            placeholder={t('ENTER_ANSWER')}
                            maxLength={200}
                            autoFocus={true}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className={styles.cardInput}
                        />
                        {hints && hints.length > 0 && (
                            <div className={styles.hintsSection}>
                                <button
                                    className={styles.hintsToggle}
                                    onClick={() => setShowHints(h => !h)}
                                    type="button"
                                >
                                    {t('HINTS_LABEL' as any)} {showHints ? '▲' : '▼'}
                                </button>
                                {showHints && (
                                    <div className={styles.hintsList}>
                                        {selectedHints.map((hint, i) => (
                                            <span key={i} className={styles.hintItem} onClick={() => setAnswer(hint)}>{hint}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.buttonContainer}>
                            <Button
                                label={t('SAVE')}
                                variant='secondary'
                                phase={Phases.Main}
                                onClick={handleSubmit}
                                disabled={!answer.trim()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
