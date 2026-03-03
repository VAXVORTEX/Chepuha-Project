import React, { useState } from "react";
import styles from "./GameCode.module.scss";
import { useLanguage } from "../../contexts/LanguageContext";
interface GameCodeProps {
    code: string;
    className?: string;
}
const GameCode: React.FC<GameCodeProps> = ({ code, className = "" }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`${styles.container} ${className}`}
            onClick={handleCopy}
            title={t('CLICK_TO_COPY' as any)}
        >
            <span className={styles.label}>{copied ? t('COPIED' as any) : t('GAME_CODE_LABEL')}</span>
            <span className={styles.code}>{code}</span>
        </div>
    );
}
export default GameCode;