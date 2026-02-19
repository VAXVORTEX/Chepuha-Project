import React, { useState } from "react";
import styles from "./WaitCard.module.scss";
import Button from "../Button/Button";

interface WaitCardProps {
  nick: string;
  joinedCount: number;
  totalCount: number;
  onHome: () => void;
  onStartGame?: () => void;
}

const WaitCard: React.FC<WaitCardProps> = ({
  nick,
  joinedCount,
  totalCount,
  onHome,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.yellowGuy} />
      <div className={styles.redGuy} />

      <div className={styles.container}>
        <h2 className={styles.nickText}>ВАШ НІК: {nick}</h2>
        <p className={styles.countText}>
          {joinedCount} з {totalCount} ГРАВЦІВ ПРИЄДНАЛОСЬ
        </p>
        <h1 className={styles.waitingText}>ЧЕКАЄМО НА ПОЧАТОК ГРИ...</h1>
      </div>

      <button className={styles.home} onClick={onHome} type="button" aria-label="На головну">
        <div className={styles.homeSign}></div>
      </button>
    </div>
  );
};
export default WaitCard;
