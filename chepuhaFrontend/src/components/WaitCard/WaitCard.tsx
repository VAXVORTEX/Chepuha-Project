import React from "react";
import styles from "./WaitCard.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";
import { renderThemedNickname, getFontSize } from "../../utils/nickname";

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
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
  const baseSize = isPC ? 45 : 28;
  // Calculate a unified font-size for both the label and the nickname
  const fullLabel = t('YOUR_NICK');
  const displayNick = nick || '';
  const fontSize = getFontSize(fullLabel + " " + displayNick, baseSize);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div 
          className={styles.nickLabel + " notranslate"} 
          translate="no"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'nowrap',
            width: '100%',
            fontSize: fontSize // Ensure parent has it too for em units
          }}
        >
          <span className={styles.labelPart} style={{ fontSize, lineHeight: 1 }}>{fullLabel}</span>
          <span style={{ fontSize, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
            {renderThemedNickname(displayNick, playerColor || '', baseSize, true, false, true, fontSize)}
          </span>
        </div>
        <p className={styles.countText}>
          {joinedCount} / {totalCount} {t('PLAYERS_READY')}
        </p>
        <h1 className={styles.waitingText}>{message || t('WAITING_PLAYERS')}</h1>
      </div>
    </div>
  );
};

export default WaitCard;