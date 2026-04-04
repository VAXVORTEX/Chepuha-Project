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
  const labelSize = isPC ? 45 : 28;
  const nickBaseSize = isPC ? 45 : 36;
  const fullLabel = t('YOUR_NICK');
  const displayNick = nick || '';
  // Size nick independently — don't combine with label length
  const nickFontSize = getFontSize(displayNick, nickBaseSize);
  // Label uses a stable size (not scaled by nick length)
  const labelFontSize = `${labelSize}px`;

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
            flexWrap: 'wrap',
            width: '100%',
            fontSize: nickFontSize
          }}
        >
          <span className={styles.labelPart} style={{ fontSize: labelFontSize, lineHeight: 1 }}>{fullLabel}</span>
          <span style={{ fontSize: nickFontSize, lineHeight: 1, display: 'inline-block', wordBreak: 'break-all', textAlign: 'center', maxWidth: '100%' }}>
            {renderThemedNickname(displayNick, playerColor || '', nickBaseSize, true, false, true, nickFontSize)}
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