import React from "react";
import styles from "./Round.module.scss";

interface RoundProps {
    currentRound: number;
    totalRounds: number;
    className?: string;
}

const Round: React.FC<RoundProps> = ({ currentRound, totalRounds, className = ""}) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <span className={styles.label}>РАУНД</span>
            <span className={styles.value}>{currentRound}/{totalRounds}</span>
        </div>
    );
};

export default Round;