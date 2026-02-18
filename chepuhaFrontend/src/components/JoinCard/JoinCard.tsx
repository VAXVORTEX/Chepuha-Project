import React, { useState } from "react";
import classNames from "classnames";
import styles from "./JoinCard.module.scss";
import { Phases } from "../../types/phaseVariant";
import Input from "../Input/Input";

interface JoinCardProps {
  nick: string;
  setNick: (val: string) => void;
  roomCode: string;
  setRoomCode: (val: string) => void;
  onJoin: () => void;
  onHome: () => void;
  errors?: {
    nick?: string;
    room?: string;
    all?: string;
  };
}

const JoinCard: React.FC<JoinCardProps> = ({
  nick,
  setNick,
  roomCode,
  setRoomCode,
  onJoin,
  onHome,
  errors,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const doJoinClick = () => {
    setIsSubmitted(true);

    if (nick.trim() && roomCode.trim()) {
      onJoin();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.YellowGuy} />
      <div className={styles.RedGuy} />

      <div className={styles.container}>
        <div className={styles.form}>
          <div className={styles.inputWrapper}>
            <Input
              value={nick}
              onChange={setNick}
              placeholder="Введіть ваш нік..."
              className={styles.input}
            />
            {(errors?.nick || (isSubmitted && !nick.trim())) && (
              <span className={styles.errorText}>
                {errors?.nick || "Введіть нікнейм..."}
              </span>
            )}
          </div>

          <div className={styles.inputWrapper}>
            <Input
              value={roomCode}
              onChange={setRoomCode}
              placeholder="Введіть номер кімнати..."
              className={styles.input}
            />
            {(errors?.room || (isSubmitted && !roomCode.trim())) && (
              <span className={styles.errorText}>
                {errors?.room || "Гра з таким кодом не існує"}
              </span>
            )}
          </div>

          <div className={styles.submitBlock}>
            <button className={styles.joinButton} onClick={doJoinClick}>
              ПРИЄДНАТИСЯ
            </button>
            {errors?.all && <p className={styles.errorText}>{errors?.all}</p>}
          </div>
        </div>
      </div>
      <div className={styles.home} onClick={onHome}>
        <div className={styles.homeSign}></div>
      </div>
    </div>
  );
};
export default JoinCard;
