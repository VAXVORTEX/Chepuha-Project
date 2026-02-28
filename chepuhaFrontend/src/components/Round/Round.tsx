import React from "react";
import styles from "./Round.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";
interface RoundProps {
    currentRound: number;
    totalRounds: number;
    className?: string;
}
const Round: React.FC<RoundProps> = ({ currentRound, totalRounds, className = "" }) => {
    const { t } = useLanguage();
    return (
        <div className={`${styles.container} ${className}`}>
            <span className={styles.label}>{t('ROUND')}</span>
            <span className={styles.value}>{currentRound}/{totalRounds}</span>
        </div>
    );
};
export default Round;