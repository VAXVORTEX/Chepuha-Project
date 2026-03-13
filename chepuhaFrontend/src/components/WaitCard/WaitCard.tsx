import React, { useState } from "react";
import styles from "./WaitCard.module.scss";
import Button from "../Button/Button";
import { playSecretMusic } from "../../utils/audio";
import { useLanguage } from "../../contexts/LanguageContext";
interface WaitCardProps {
  nick: string;
  playerColor?: string;
  joinedCount: number;
  totalCount: number;
  currentRound?: number;
  totalRounds?: number;
  message?: string;
}
const WaitCard: React.FC<WaitCardProps> = ({
  nick,
  playerColor,
  joinedCount,
  totalCount,
  message,
}) => {
  const { t } = useLanguage();
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.nickText}>{t('YOUR_NICK')} <span style={{ color: playerColor || 'inherit' }}>{nick}</span></h2>
        <p className={styles.countText}>
          {joinedCount} / {totalCount} {t('PLAYERS_READY')}
        </p>
        <h1 className={styles.waitingText}>{message || t('WAITING_PLAYERS')}</h1>
      </div>
    </div>
  );
};
export default WaitCard;
