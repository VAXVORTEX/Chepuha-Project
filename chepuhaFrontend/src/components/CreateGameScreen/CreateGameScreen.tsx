import React from 'react';
import GameCode from '../GameCode/GameCode';
import GameInput from '../GameInput/GameInput';
import Button from '../Button/Button';
import { Phases } from '../../types/phaseVariant';
import './CreateGameScreen.scss';

export interface CreateGameScreenProps {
  roomCode: string;
  nickname: string;
  error: string;
  carouselIndex: number;
  carouselTemplates: string[];
  gameLength: 6 | 9 | 12;
  colorHighlight: boolean;
  hintsEnabled: boolean;
  storyMode: boolean;
  phase: Phases;
  t: (key: string) => string | any;
  carouselRef: React.RefObject<HTMLDivElement>;
  onNicknameChange: (val: string) => void;
  onEnter: () => void;
  onCarouselWheel: (e: React.WheelEvent) => void;
  onCarouselTouchStart: (e: React.TouchEvent) => void;
  onCarouselTouchEnd: (e: React.TouchEvent) => void;
  moveCarousel: (dir: 1 | -1) => void;
  onGameLengthChange: (len: 6 | 9 | 12) => void;
  onColorHighlightToggle: () => void;
  onHintsEnabledToggle: () => void;
  onStoryModeToggle: () => void;
  onGoToLobby: () => void;
}

const CreateGameScreen: React.FC<CreateGameScreenProps> = ({
  roomCode,
  nickname,
  error,
  carouselIndex,
  carouselTemplates,
  gameLength,
  colorHighlight,
  hintsEnabled,
  storyMode,
  phase,
  t,
  carouselRef,
  onNicknameChange,
  onEnter,
  onCarouselWheel,
  onCarouselTouchStart,
  onCarouselTouchEnd,
  moveCarousel,
  onGameLengthChange,
  onColorHighlightToggle,
  onHintsEnabledToggle,
  onStoryModeToggle,
  onGoToLobby,
}) => {
  return (
    <>
      <div className="create-game-pc-code-wrapper">
        {roomCode && <GameCode code={roomCode} className="gameCodePos create-code-mobile" />}
      </div>
      <div className="create-game-container">
        <GameInput
          value={nickname}
          onChange={onNicknameChange}
          onEnter={onEnter}
          placeholder={t('ENTER_NICK_PLACEHOLDER')}
          errorText={error}
          maxLength={25}
          contextType="nickname"
        />

        <div className="create-options-row">
          <div className="carousel-section">
            <h3 className="template-title" style={{ marginBottom: "15px", whiteSpace: "nowrap", textAlign: "center" }}>
              {t('CHOOSE_STORY')}
            </h3>
            <div
              className="template-carousel"
              ref={carouselRef}
              onWheel={onCarouselWheel}
              onTouchStart={onCarouselTouchStart}
              onTouchEnd={onCarouselTouchEnd}
            >
              <button className="carousel-arrow carousel-arrow-up" onClick={() => moveCarousel(-1)}>▲</button>
              <div className="carousel-window">
                {[-2, -1, 0, 1, 2].map(offset => {
                  const idx = (carouselIndex + offset + carouselTemplates.length) % carouselTemplates.length;
                  const id = carouselTemplates[idx];
                  const label = id === 'random' ? t('RANDOM') : id === 'custom_ai' ? '🤖 Щі Розповідь' : (t(id.toUpperCase()) || id);
                  const isCenter = offset === 0;
                  return (
                    <div
                      key={idx}
                      className={`carousel-item ${isCenter ? 'carousel-item--center' : ''} carousel-item--offset-${offset < 0 ? 'neg' : 'pos'}${Math.abs(offset)}`}
                      onClick={() => {
                        const steps = offset as 1 | -1 | 0;
                        if (steps !== 0) moveCarousel(steps > 0 ? 1 : -1);
                      }}
                    >
                      <span className="carousel-item-label">{label}</span>
                    </div>
                  );
                })}
              </div>
              <button className="carousel-arrow carousel-arrow-down" onClick={() => moveCarousel(1)}>▼</button>
            </div>
          </div>

          <div className="game-settings-container">
            <div className="game-settings-section">
              <div className="game-length-picker">
                <h3 className="template-title">{t('GAME_LENGTH_TITLE')}</h3>
                {([6, 9, 12] as Array<6 | 9 | 12>).map(len => (
                  <label key={len} className={`length-option ${gameLength === len ? 'length-option--active' : ''}`}>
                    <input type="radio" name="gameLength" value={len} checked={gameLength === len}
                      onChange={() => onGameLengthChange(len)} />
                    <span className="length-pill">
                      {len === 6 ? t('GAME_LENGTH_SHORT') : len === 9 ? t('GAME_LENGTH_NORMAL') : t('GAME_LENGTH_LONG')}
                    </span>
                  </label>
                ))}
              </div>

              <div className="extra-options">
                <label className={`toggle-option ${colorHighlight ? 'toggle-option--active' : ''}`} onClick={onColorHighlightToggle}>
                  <span className="toggle-label">🎨 {t('OPTS_HIGHLIGHTS')}</span>
                  <div className="toggle-switch">
                    <div className={`toggle-knob ${colorHighlight ? 'toggle-knob--on' : ''}`} />
                  </div>
                </label>

                <label className={`toggle-option ${hintsEnabled ? 'toggle-option--active' : ''}`} onClick={onHintsEnabledToggle}>
                  <span className="toggle-label">💡 {t('OPTS_HINTS')}</span>
                  <div className="toggle-switch">
                    <div className={`toggle-knob ${hintsEnabled ? 'toggle-knob--on' : ''}`} />
                  </div>
                </label>

                <div style={{ position: 'relative', width: '100%' }}>
                  <label className={`toggle-option ${storyMode ? 'toggle-option--active' : ''}`} onClick={onStoryModeToggle}>
                    <span className="toggle-label">🕹 {t('STORY_MODE')}</span>
                    <div className="toggle-switch">
                      <div className={`toggle-knob ${storyMode ? 'toggle-knob--on' : ''}`} />
                    </div>
                  </label>
                  {storyMode && <div className="story-mode-desc-container"><p className="story-mode-desc">{t('STORY_MODE_DESC')}</p></div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button
            label={t('CREATE_GAME')}
            variant="primary"
            phase={phase}
            onClick={onGoToLobby}
          />
        </div>
      </div>
    </>
  );
};

export default CreateGameScreen;
