import { useState, useEffect } from 'react';

export const useLobbyTimer = (
  isLobby: boolean,
  sessionCreatedAt: string | null,
  lobbyCreatedAt: number | null,
  serverTimeOffset: number,
  goHome: () => void,
  setAppState: any
) => {
  const [lobbyTimeLeft, setLobbyTimeLeft] = useState<number | string>("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLobby) {
      interval = setInterval(() => {
        let diff = 0;
        const LOBBY_TIMEOUT = 25 * 60 * 1000; // 25 minutes
        
        if (sessionCreatedAt) {
          const sessionStart = new Date(sessionCreatedAt).getTime();
          const serverNow = Date.now() + serverTimeOffset;
          diff = LOBBY_TIMEOUT - (serverNow - sessionStart);
        } else if (lobbyCreatedAt) {
          diff = LOBBY_TIMEOUT - (Date.now() - lobbyCreatedAt);
        } else {
          // If we don't know when it was created, we can't show a timer accurately,
          // but we set a default so it doesn't expire instantly.
          diff = LOBBY_TIMEOUT;
        }
        
        if (diff <= 0) {
          clearInterval(interval);
          setAppState((prev: any) => ({ ...prev, error: "SESSION_EXPIRED_TIME" }));
          goHome();
        } else {
          setLobbyTimeLeft(Math.floor(diff / 1000));
        }
      }, 1000);
    } else {
      setLobbyTimeLeft("");
    }
    return () => clearInterval(interval);
  }, [isLobby, sessionCreatedAt, lobbyCreatedAt, serverTimeOffset, goHome, setAppState]);

  return lobbyTimeLeft;
};
