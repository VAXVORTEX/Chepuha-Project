import React from 'react';
import Input from '../Input/Input';
import styles from './GameInput.module.scss';
import { getFontSize } from '../../utils/nickname';
import { useLanguage } from '../../contexts/LanguageContext';

interface GameInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  placeholder: string;
  errorText: string | null;
  maxLength?: number;
  isRoomCode?: boolean;
  autoFocus?: boolean;
  contextType?: 'nickname' | 'answer' | 'room' | 'default';
}

const GameInput: React.FC<GameInputProps> = ({
  value,
  onChange,
  onEnter,
  placeholder,
  errorText,
  maxLength = 25,
  isRoomCode = false,
  autoFocus = false,
  contextType = 'default'
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className={styles.container}>
      <Input
        value={value}
        onChange={(val) => {
          if (val.length <= maxLength) {
            onChange(val);
          }
        }}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onEnter()}
        className={`${styles.input} ${errorText ? styles.errorInput : ''}`}
        style={{ fontSize: getFontSize(value || placeholder, typeof window !== 'undefined' && window.innerWidth > 768 ? 48 : 32, contextType) }}
        autoFocus={autoFocus}
      />
      <span
        className={styles.errorText}
        style={{ visibility: errorText || (value.length >= maxLength && !isRoomCode) ? 'visible' : 'hidden' }}
      >
        {value.length >= maxLength && !isRoomCode ? (maxLength === 25 ? t('ERR_NICK_LONG') : (language === 'uk' ? `Максимум ${maxLength} символів` : `Max ${maxLength} characters`)) : (errorText || 'ERROR')}
      </span>
    </div>
  );
};

export default GameInput;
