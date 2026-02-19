import React, { useState } from "react";
import classNames from "classnames";
import styles from "./JoinCard.module.scss";
import { Phases } from "../../types/phaseVariant";
import Input from "../Input/Input";

interface JoinCardProps {
  onJoin: (nick: string, room: string) => void;
  onHome: () => void;
  errors?: {
    nick?: string;
    room?: string;
  };
}

const JoinCard: React.FC<JoinCardProps> = ({
  onJoin,
  onHome,
  errors,
}) => {
  const [nickInputValue, setNickInputValue] = useState("");
   const [roomInputValue, setRoomInputValue] = useState("");
   const [isSubmitted, setIsSubmitted] = useState(false);

  const doJoinClick = () => {
    setIsSubmitted(true);
      onJoin(nickInputValue,roomInputValue);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.YellowGuy} />
      <div className={styles.RedGuy} />

      <div className={styles.container}>
        <div className={styles.form}>
          <div className={styles.inputWrapper}>
            <Input
              value={nickInputValue}
              onChange={setNickInputValue}
              placeholder="Введіть ваш нік..."
              className={styles.input}
            />
            {(errors?.nick || (isSubmitted && !nickInputValue.trim())) && (
              <span className={styles.errorText}>
                {errors?.nick || "Введіть нікнейм..."}
              </span>
            )}
          </div>

          <div className={styles.inputWrapper}>
            <Input
              value={roomInputValue}
              onChange={setRoomInputValue}
              placeholder="Введіть номер кімнати..."
              className={styles.input}
            />
            {(errors?.room || (isSubmitted && !roomInputValue.trim())) && (
              <span className={styles.errorText}>
                {errors?.room || "Гра з таким кодом не існує"}
              </span>
            )}
          </div>

          <div className={styles.submitBlock}>
            <button className={styles.joinButton} onClick={doJoinClick}>
              ПРИЄДНАТИСЯ
            </button>
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
