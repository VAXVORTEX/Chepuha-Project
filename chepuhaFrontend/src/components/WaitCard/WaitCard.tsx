import React from "react";
import styles from "./WaitCard.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";
import { renderThemedNickname } from "../../utils/nickname";

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
        <h2 className={styles.nickLabel + " notranslate"} translate="no">
          {t('YOUR_NICK')} {renderThemedNickname(nick, playerColor || '', 36, true)}
        </h2>
        <p className={styles.countText}>
          {joinedCount} / {totalCount} {t('PLAYERS_READY')}
        </p>
        <h1 className={styles.waitingText}>{message || t('WAITING_PLAYERS')}</h1>
      </div>
    </div>
  );
};

export default WaitCard;