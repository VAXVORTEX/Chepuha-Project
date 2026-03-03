import React, { useState } from 'react';
import styles from './RoundCard.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Phases } from '../../types/phaseVariant';
import { useLanguage } from '../../contexts/LanguageContext';
import { TranslationKey } from '../../config/i18n';
interface RoundCardProps {
    playerName: string;
    phase: Phases;
    question?: string;
    playerReady?: number;
    playerTotal?: number;
    onSubmitAnswer?: (answer: string) => void;
}
export const RoundCard = ({
    playerName,
    phase,
    question = '',
    playerReady = 0,
    playerTotal = 0,
    onSubmitAnswer
}: RoundCardProps) => {
    const [answer, setAnswer] = useState('');
    const { t } = useLanguage();
    const isWaiting = phase === Phases.Waiting;
    const handleSubmit = () => {
        if (onSubmitAnswer && answer.trim() !== '') {
            onSubmitAnswer(answer);
            setAnswer('');
        }
    };
    return (
        <div className={`${styles.roundCard} ${isWaiting ? styles.waiting : ''}`}>
            <div className={styles.header}>
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