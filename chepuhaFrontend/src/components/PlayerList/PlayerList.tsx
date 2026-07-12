import React, { memo } from 'react';
import classNames from 'classnames';
import { Player } from '@api/types';
import { renderThemedNickname, getFontSize } from '../../utils/nickname';
import './PlayerList.scss';

export interface PlayerListProps {
  players: Player[];
  playerId: string | null;
  nickname: string;
  playerColor: string;
  parsedColorHighlight: boolean;
  availableColors: string[];
  crownImage: string;
  playersListRef: React.RefObject<HTMLDivElement>;
  cycleColor: (dir: 1 | -1) => void;
}

export const PlayerItem = memo(({ p, i, isMe, playerColor, cycleColor, availableColors, crownImage, showColorPicker }: {
  p: Partial<Player>;
  i: number;
  isMe: boolean;
  playerColor: string;
  cycleColor: (dir: 1 | -1) => void;
  availableColors: string[];
  crownImage: string;
  showColorPicker: boolean;
}) => {
  const defaultColor = availableColors[i % availableColors.length];
  const activeColor = isMe && playerColor ? playerColor : (p.color || defaultColor);
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <div key={p.id || String(i)} className="player-item" data-player-id={p.id}>
      <div className="player-name-wrapper-new">
        <div className="player-side-container left">
          {i === 0 && <img src={crownImage} alt="Host" className="crown-icon-new" />}
        </div>
        {(() => {
          const baseSize = isPC ? 75 : 40;
          const fontSize = getFontSize(p.nickname || '', baseSize);
          return renderThemedNickname(p.nickname || '', activeColor, baseSize, showColorPicker, false, true, fontSize);
        })()}
        <div className="player-side-container right">
          {isMe && showColorPicker && (
            <div className="inline-color-picker-new">
              <button className="inline-color-arrow" onClick={() => cycleColor(-1)}>◀</button>
              <div className={classNames("inline-color-swatch", activeColor?.startsWith('special:') ? activeColor.replace('special:', '') : '')} style={!activeColor?.startsWith('special:') ? { background: activeColor } : {}} />
              <button className="inline-color-arrow" onClick={() => cycleColor(1)}>▶</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  playerId,
  nickname,
  playerColor,
  parsedColorHighlight,
  availableColors,
  crownImage,
  playersListRef,
  cycleColor,
}) => {
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
  const hasThemedPlayers = players.some(p => p.color?.startsWith('special:'));

  const getListHeight = () => {
    const padding = 20;
    const playersToMeasure = players.length > 0 ? players : [{ color: '' }];

    if (isPC) {
      const stdH = 75;
      const specialH = 107;
      const gap = 12;
      let total = 0;
      for (let i = 0; i < 4; i++) {
        const p = playersToMeasure[i] || playersToMeasure[0];
        total += (p.color?.startsWith('special:') ? specialH : stdH) + gap;
      }
      const p5 = playersToMeasure[4] || playersToMeasure[0];
      total += (p5.color?.startsWith('special:') ? specialH : stdH) * 0.5;
      return total + padding;
    } else {
      const stdH = 48;
      const specialH = 56;
      const gap = 6;
      let total = 0;
      for (let i = 0; i < 4; i++) {
        const p = playersToMeasure[i] || playersToMeasure[0];
        total += (p.color?.startsWith('special:') ? specialH : stdH) + gap;
      }
      const p5 = playersToMeasure[4] || playersToMeasure[0];
      total += (p5.color?.startsWith('special:') ? specialH : stdH) * 0.5;
      return total + padding;
    }
  };

  const dynamicHeight = getListHeight();

  return (
    <div
      ref={playersListRef}
      className={`players-list ${hasThemedPlayers ? 'has-themed-names' : ''} ${(players.length >= 4) ? 'has-many-players' : ''}`}
      style={{ height: `${dynamicHeight}px` }}
    >
      {players.length > 0 ? (
        players.map((p, i) => (
          <PlayerItem
            key={p.id || String(i)}
            p={p}
            i={i}
            isMe={String(p.id) === String(playerId) || (i === 0 && nickname === p.nickname)}
            playerColor={playerColor}
            cycleColor={cycleColor}
            availableColors={availableColors}
            crownImage={crownImage}
            showColorPicker={parsedColorHighlight}
          />
        ))
      ) : (
        <PlayerItem
          p={{ id: 'temp', nickname }}
          i={0}
          isMe={true}
          playerColor={playerColor}
          cycleColor={cycleColor}
          availableColors={availableColors}
          crownImage={crownImage}
          showColorPicker={parsedColorHighlight}
        />
      )}
    </div>
  );
};

export default PlayerList;
