import React, {useState} from 'react';
import styles from './RoundCard.module.scss';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Phases } from '../../types/phaseVariant';

interface RoundCardProps{
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

    const isWaiting = phase === Phases.Waiting;

    const handleSubmit = () => {
        if(onSubmitAnswer && answer.trim() !== ''){
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
                        <h3 className={styles.successText}>Відповідь <br /> зараховано!</h3>
                        <div className={styles.counter}>
                            Очікування: <span>{playerReady} / {playerTotal}</span> гравців
                        </div>
                    </div>
                ) : (
                    <div className={styles.activeContent}>
                        <h3 className={styles.question}>{question}</h3>
                        <Input
                            value={answer}
                            onChange={setAnswer}
                            placeholder='Введіть вашу відповідь...'
                            maxLength={200}
                            autoFocus ={true}
                            className={styles.cardInput}
                        />

                        <div className={styles.buttonContainer}>
                            <Button
                                label='Зберегти'
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