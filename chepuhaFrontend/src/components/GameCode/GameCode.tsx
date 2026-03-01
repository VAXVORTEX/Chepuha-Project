import React from "react";
import styles from "./GameCode.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";
interface GameCodeProps {
    code: string;
    className?: string;
}
const GameCode: React.FC<GameCodeProps> = ({ code, className = "" }) => {
    const { t } = useLanguage();
    return (
        <div className={`${styles.container} ${className}`}>
            <span className={styles.label}>{t('GAME_CODE_LABEL')}</span>
            <span className={styles.code}>{code}</span>
        </div>
    );
}
export default GameCode;