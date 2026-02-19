import React from "react";
import styles from "./GameCode.module.scss";

interface GameCodeProps {
    code: string;
    className?: string;
}

const GameCode: React.FC<GameCodeProps> = ({ code, className = "" }) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <span className={styles.label}>КОД ГРИ</span>
            <span className={styles.code}>{code}</span>
        </div>
    );
}

export default GameCode;