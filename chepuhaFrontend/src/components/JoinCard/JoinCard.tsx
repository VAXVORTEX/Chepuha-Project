import React, { useState } from "react";
import classNames from "classnames";
import styles from "./JoinCard.module.scss";
import Button from "../Button/Button";
import HomeIcon from "../HomeIcon/HomeIcon";
import { playSecretMusic } from "../../utils/audio";
import { Phases } from "../../types/phaseVariant";
import GameInput from "../GameInput/GameInput";
import { useLanguage } from "../../contexts/LanguageContext";
import { getFontSize } from "../../utils/nickname";
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
          <GameInput
            value={nickInputValue}
            onChange={(val) => {
              setNickInputValue(val);
              setIsSubmitted(false);
            }}
            onEnter={doJoinClick}
            placeholder={t('ENTER_NICK_PLACEHOLDER')}
            errorText={errors?.nick || (isSubmitted && !nickInputValue.trim() ? t('NICKNAME_REQUIRED') : null)}
            maxLength={25}
            contextType="nickname"
          />
          <GameInput
            value={roomInputValue}
            onChange={(val) => {
              setRoomInputValue(val.toUpperCase());
              setIsSubmitted(false);
            }}
            onEnter={doJoinClick}
            placeholder={t('ENTER_ROOM_PLACEHOLDER')}
            errorText={errors?.room || (isSubmitted && !roomInputValue.trim() ? t('ROOM_NOT_FOUND') : null)}
            maxLength={8}
            isRoomCode={true}
            contextType="room"
          />
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