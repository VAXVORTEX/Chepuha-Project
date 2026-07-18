import React, { useState } from 'react';
import styles from './RoundCard.module.scss';
import Button from '../Button/Button';
import GameInput from '../GameInput/GameInput';
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
    showColors?: boolean;
}
import { renderThemedNickname } from '../../utils/nickname';

export const RoundCard = ({
    playerName,
    playerColor,
    phase,
    question = '',
    playerReady = 0,
    playerTotal = 0,
    onSubmitAnswer,
    hints,
    showColors = true
}: RoundCardProps) => {
    const [answer, setAnswer] = useState('');
    const [showHints, setShowHints] = useState(false);
    const [selectedHints, setSelectedHints] = useState<string[]>([]);
    const { t, language } = useLanguage();

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
        if (onSubmitAnswer && answer.trim() !== '' && answer.length <= 500) {
            onSubmitAnswer(answer);
            setAnswer('');
        }
    };

    return (
        <div className={`${styles.roundCard} ${isWaiting ? styles.waiting : ''}`}>
            <div className={styles.header}>
                <h2 className={styles.playerName}>
                    {renderThemedNickname(playerName, playerColor || '', 55, showColors)}
                </h2>
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
                        <h3 className={styles.question}>{question ? (t(question as TranslationKey) !== question && t(question as TranslationKey) ? t(question as TranslationKey) : question) : ''}</h3>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '850px', marginBottom: '40px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
                            <GameInput
                                value={answer}
                                onChange={setAnswer}
                                onEnter={handleSubmit}
                                placeholder={t('ENTER_ANSWER')}
                                maxLength={500}
                                autoFocus={true}
                                errorText={answer.length >= 500 ? t('CHAR_LIMIT_REACHED') : null}
                                contextType="answer"
                            />
                        </div>
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
                            <button
                                className={styles.answerButton}
                                onClick={handleSubmit}
                                disabled={!answer.trim()}
                            >
                                {t('ANSWER_SUBMIT' as any) === 'ANSWER_SUBMIT' ? (language === 'uk' ? 'Відповісти' : 'Answer') : t('ANSWER_SUBMIT' as any)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};