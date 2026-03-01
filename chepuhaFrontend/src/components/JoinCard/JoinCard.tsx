import React, { useState } from "react";
import classNames from "classnames";
import styles from "./JoinCard.module.scss";
import Button from "../Button/Button";
import HomeIcon from "../HomeIcon/HomeIcon";
import { playSecretMusic } from "../../utils/audio";
import { Phases } from "../../types/phaseVariant";
import Input from "../Input/Input";
import { useLanguage } from "../../contexts/LanguageContext";
interface JoinCardProps {
  onJoin: (nick: string, room: string) => void;
  errors?: {
    nick?: string;
    room?: string;
  };
}
const JoinCard: React.FC<JoinCardProps> = ({
  onJoin,
  errors,
}) => {
  const { t } = useLanguage();
  const [nickInputValue, setNickInputValue] = useState("");
  const [roomInputValue, setRoomInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const doJoinClick = () => {
    setIsSubmitted(true);
    if (!nickInputValue.trim() || !roomInputValue.trim()) {
      return;
    }
    onJoin(nickInputValue, roomInputValue);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.form}>
          <div className={styles.inputWrapper}>
            <Input
              value={nickInputValue}
              onChange={(value) => {
                setNickInputValue(value);
                setIsSubmitted(false);
              }}
              placeholder={t('ENTER_NICK_PLACEHOLDER')}
              className={styles.input}
            />
            {(errors?.nick || (isSubmitted && !nickInputValue.trim())) && (
              <span className={styles.errorText}>
                {errors?.nick || t('NICKNAME_REQUIRED')}
              </span>
            )}
          </div>
          <div className={styles.inputWrapper}>
            <Input
              value={roomInputValue}
              onChange={setRoomInputValue}
              placeholder={t('ENTER_ROOM_PLACEHOLDER')}
              className={styles.input}
            />
            {(errors?.room || (isSubmitted && !roomInputValue.trim())) && (
              <span className={styles.errorText}>
                {errors?.room || t('ROOM_NOT_FOUND')}
              </span>
            )}
          </div>
          <div className={styles.submitBlock}>
            <Button
              label={t('JOIN_GAME')}
              variant="primary"
              onClick={doJoinClick}
              phase={Phases.Join}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default JoinCard;
