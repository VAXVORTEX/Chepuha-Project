import React from 'react';
import Input from '../Input/Input';
import './CustomTopicModal.scss';

export interface CustomTopicModalProps {
  customTopic: string;
  isGeneratingQuestions: boolean;
  error: string;
  t: (key: string) => string | any;
  onClose: () => void;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
}

const CustomTopicModal: React.FC<CustomTopicModalProps> = ({
  customTopic,
  isGeneratingQuestions,
  error,
  t,
  onClose,
  onTopicChange,
  onSubmit,
}) => {
  return (
    <div
      className="custom-prompt-overlay"
      onClick={!isGeneratingQuestions ? onClose : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="input-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 'clamp(15px, 5vw, 50px)',
          boxSizing: 'border-box',
          textAlign: 'center',
          maxWidth: '1400px',
          width: '98%',
          flexDirection: 'column',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <h2
          className="template-title"
          style={{
            marginBottom: 'clamp(10px, 2vw, 20px)',
            fontSize: 'clamp(24px, 5vw, 64px)',
            whiteSpace: 'normal',
            lineHeight: '1.2',
            color: '#fff',
            textShadow:
              '4px 4px 8px rgba(0,0,0,0.8), -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
            textAlign: 'center',
          }}
        >
          {t('CUSTOM_TOPIC') || 'Введіть власну тему:'}
        </h2>
        <div className="custom-topic-wrapper">
          <button
            onClick={onClose}
            disabled={isGeneratingQuestions}
            style={{
              width: 'clamp(41px, 10vw, 74px)',
              height: 'clamp(41px, 10vw, 74px)',
              borderRadius: '50%',
              background: '#ff4d4f',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10,
              fontSize: 'clamp(20px, 6vw, 32px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isGeneratingQuestions ? 0.5 : 1,
              flexShrink: 0,
            }}
            title={t('BACK')}
          >
            ✕
          </button>

          <Input
            type="text"
            maxLength={50}
            autoFocus={true}
            value={customTopic}
            onChange={onTopicChange}
            placeholder=""
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={isGeneratingQuestions}
            style={{
              border: 'none',
              background: 'transparent',
              maxWidth: '100%',
              padding: '0 5px',
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 'clamp(20px, 4vw, 48px)',
              outline: 'none',
              boxShadow: 'none',
              textAlign: 'center',
              alignSelf: 'center',
            }}
          />

          <button
            onClick={onSubmit}
            disabled={isGeneratingQuestions || !customTopic.trim()}
            style={{
              width: 'clamp(41px, 10vw, 74px)',
              height: 'clamp(41px, 10vw, 74px)',
              borderRadius: '50%',
              background: '#52c41a',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10,
              fontSize: 'clamp(20px, 6vw, 32px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isGeneratingQuestions || !customTopic.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
            title="Створити"
          >
            {isGeneratingQuestions ? '⏳' : '✓'}
          </button>
        </div>
        {error && (
          <span className="error-message" style={{ display: 'block', marginTop: '15px' }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomTopicModal;
