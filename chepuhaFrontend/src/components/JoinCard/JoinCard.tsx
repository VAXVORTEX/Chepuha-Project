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
  initialNick?: string;
  initialRoom?: string;
  onJoin: (nick: string, room: string) => void;
  onBack?: () => void;
  loading?: boolean;
  errors?: {
    nick?: string;
    room?: string;
  };
}
const JoinCard: React.FC<JoinCardProps> = ({
  initialNick = "",
  initialRoom = "",
  onJoin,
  onBack,
  loading = false,
  errors,
}) => {
  const { t } = useLanguage();
  const [nickInputValue, setNickInputValue] = useState(initialNick);
  const [roomInputValue, setRoomInputValue] = useState(initialRoom);
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
                if (value.length <= 25) {
                  setNickInputValue(value);
                  setIsSubmitted(false);
                }
              }}
              placeholder={t('ENTER_NICK_PLACEHOLDER')}
              onKeyDown={(e) => e.key === 'Enter' && doJoinClick()}
              className={styles.input}
            />
            <span
              className={styles.errorText}
              style={{ visibility: (nickInputValue.length >= 25 || errors?.nick || (isSubmitted && !nickInputValue.trim())) ? 'visible' : 'hidden' }}
            >
              {nickInputValue.length >= 25
                ? t('ERR_NICK_LONG')
                : (errors?.nick || (isSubmitted && !nickInputValue.trim())
                  ? (errors?.nick || t('NICKNAME_REQUIRED'))
                  : 'ERROR')}
            </span>
          </div>
          <div className={styles.inputWrapper}>
            <Input
              value={roomInputValue}
              onChange={(val) => {
                const upper = val.toUpperCase();
                if (upper.length <= 8) {
                  setRoomInputValue(upper);
                  setIsSubmitted(false);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && doJoinClick()}
              placeholder={t('ENTER_ROOM_PLACEHOLDER')}
              className={styles.input}
            />
            <span
              className={styles.errorText}
              style={{ visibility: (errors?.room || (isSubmitted && !roomInputValue.trim())) ? 'visible' : 'hidden' }}
            >
              {(errors?.room || (isSubmitted && !roomInputValue.trim()))
                ? (errors?.room || t('ROOM_NOT_FOUND'))
                : 'ERROR'}
            </span>
          </div>
          <div className={styles.submitBlock}>
            <Button
              label={loading ? t('JOINING') : t('JOIN_GAME')}
              variant="primary"
              onClick={doJoinClick}
              phase={Phases.Join}
              disabled={loading}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default JoinCard;