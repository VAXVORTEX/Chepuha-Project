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
const getNicknameStyle = (color: string) => {
  if (color?.startsWith('special:')) return {};
  const isBlack = !color || color === '#000000' || color === '#000';
  return {
    color: color || '#000000',
    textShadow: isBlack ? 'none' : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
  };
};

const getNicknameClassName = (color: string) => {
  if (color?.startsWith('special:')) {
    return `${styles.nickText} ${color.replace('special:', '')}-text`;
  }
  return styles.nickText;
};

const WaitCard: React.FC<WaitCardProps> = ({
  nick,
  playerColor,
  joinedCount,
  totalCount,
  currentRound,
  totalRounds,
  message,
}) => {
  const { t } = useLanguage();
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.nickLabel + " notranslate"} translate="no">
          {t('YOUR_NICK')} <span className={getNicknameClassName(playerColor || '') + " notranslate"} translate="no" style={getNicknameStyle(playerColor || '')}>{nick}</span>
        </h2>
        <p className={styles.countText}>
          {joinedCount} / {totalCount} {t('PLAYERS_READY')}
        </p>
        {currentRound && totalRounds && (
          <p className={styles.roundText}>
            {t('ROUND')} {currentRound} / {totalRounds}
          </p>
        )}
        <h1 className={styles.waitingText}>{message || t('WAITING_PLAYERS')}</h1>
      </div>
    </div>
  );
};
export default WaitCard;