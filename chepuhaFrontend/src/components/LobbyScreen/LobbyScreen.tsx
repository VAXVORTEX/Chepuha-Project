import React from 'react';
import Button from '../Button/Button';
import PlayerList from '../PlayerList/PlayerList';
import { Player } from '@api/types';
import { Phases } from '../../types/phaseVariant';
import { renderThemedNickname, getFontSize } from '../../utils/nickname';
import './LobbyScreen.scss';

export interface LobbyScreenProps {
  lobbyTimeLeft: string | number;
  nickname: string;
  playerColor: string;
  parsedColorHighlight: boolean;
  players: Player[];
  playerId: string | null;
  availableColors: string[];
  crownImage: string;
  pollError: string;
  isHost: boolean;
  phase: Phases;
  t: (key: string) => string | any;
  playersListRef: React.RefObject<HTMLDivElement>;
  cycleColor: (dir: 1 | -1) => void;
  onStartGame: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  lobbyTimeLeft,
  nickname,
  playerColor,
  parsedColorHighlight,
  players,
  playerId,
  availableColors,
  crownImage,
  pollError,
  isHost,
  phase,
  t,
  playersListRef,
  cycleColor,
  onStartGame,
}) => {
  return (
    <>
      <div className="lobby-timer-display">
        <span className="timer-title">{t('LOBBY_TIMER_TITLE')}</span>
        <span className="timer-time">
          {typeof lobbyTimeLeft === 'number' ? `${Math.ceil(lobbyTimeLeft / 60)} ${t('LOBBY_MIN_SUFFIX')}` : lobbyTimeLeft}
        </span>
      </div>
      <div className="lobby-container">
        <div className="lobby-info">
          <h2 className="lobby-text label-and-nick notranslate" translate="no">
            {(() => {
              const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
              const baseSize = isPC ? 75 : 40;
              const fontSize = getFontSize(nickname, baseSize);
              return (
                <div className="label-and-nick-flex" style={{ fontSize }}>
                  <span className="label-part" style={{ fontSize: 'inherit' }}>
                    {(t('YOUR_NICK') as string).replace(':', '')}:{' '}
                  </span>
                  <div className="nick-part" style={{ fontSize: 'inherit' }}>
                    {renderThemedNickname(nickname, playerColor, baseSize, parsedColorHighlight, false, true, fontSize)}
                  </div>
                </div>
              );
            })()}
          </h2>
          <h3 className="lobby-subtitle">{t('PLAYER_LIST')}</h3>
          <PlayerList
            players={players}
            playerId={playerId}
            nickname={nickname}
            playerColor={playerColor}
            parsedColorHighlight={parsedColorHighlight}
            availableColors={availableColors}
            crownImage={crownImage}
            playersListRef={playersListRef}
            cycleColor={cycleColor}
          />
        </div>
        <div className="error-message" style={{ color: 'red', minHeight: '24px' }}>
          {pollError ? (t(pollError) || pollError) : '\u00A0'}
        </div>
        <div className="lobby-actions">
          {isHost ? (
            <Button
              label={t('START_GAME')}
              variant="primary"
              phase={phase}
              onClick={onStartGame}
              disabled={players.length < 1}
            />
          ) : (
            <h3 className="waiting-host-text">{t('WAITING_HOST')}</h3>
          )}
        </div>
      </div>
    </>
  );
};

export default LobbyScreen;
