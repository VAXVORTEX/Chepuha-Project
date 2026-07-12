import { useCallback } from 'react';
import { updatePlayer } from '@api';
import { AVAILABLE_COLORS } from '../config/colors';

export const usePlayerColor = () => {
  const cycleColor = useCallback((direction: -1 | 1, playerId: string | null, players: any[], setAppState: any) => {
    setAppState((prev: any) => {
      const idx = AVAILABLE_COLORS.indexOf(prev.playerColor || '#000000');
      const currentIdx = idx === -1 ? 0 : idx;
      let nextIdx = (currentIdx + direction + AVAILABLE_COLORS.length) % AVAILABLE_COLORS.length;

      const takenColors = (players || []).map(p => p.color).filter(c => c && c !== prev.playerColor);
      let attempts = 0;
      while (takenColors.includes(AVAILABLE_COLORS[nextIdx]) && attempts < AVAILABLE_COLORS.length) {
        nextIdx = (nextIdx + direction + AVAILABLE_COLORS.length) % AVAILABLE_COLORS.length;
        attempts++;
      }

      const newColor = AVAILABLE_COLORS[nextIdx];
      if (playerId) {
        updatePlayer(playerId, { color: newColor }).catch((err) => {
          if (String(err.message).includes('column') || String(err.message).includes('schema cache')) {
            console.warn("DB 'color' column missing, skipping sync.");
          }
        });
      }
      return { ...prev, playerColor: newColor };
    });
  }, []);

  return { cycleColor };
};
