import { useEffect, useRef } from 'react';
import { getStorySheetsBySession, getPlayersBySession, getAnswersByRound, getRoundsBySession, createRound, updateGameSession, submitAnswer } from '@api';
import { generateNextQuestion, isGroqAvailable } from '../utils/groq';
import { Phases } from '../types/phaseVariant';

export const useRoundTransitions = (
  sessionId: string | null,
  isHost: boolean,
  didGameStart: boolean,
  currentRound: number,
  gameLength: number,
  parsedStoryMode: boolean,
  players: any[] | null,
  playerId: string | null,
  currentRoundId: string | null,
  answeredRoundId: string | null,
  activeTemplate: any,
  language: string,
  customTopic: string,
  fetchFinalStoryResult: () => void,
  setAppState: any
) => {

  const transitionLockRef = useRef(false);
  const transitionLockSetAtRef = useRef<number>(0);
  const currentRoundIdRef = useRef(currentRoundId);
  const currentRoundRef = useRef(currentRound);

  useEffect(() => {
    currentRoundIdRef.current = currentRoundId;
    currentRoundRef.current = currentRound;
  }, [currentRoundId, currentRound]);

  useEffect(() => {
    if (!sessionId || !didGameStart) return;

    const transitionInterval = setInterval(async () => {
      try {
        if (transitionLockRef.current) {
          if (Date.now() - transitionLockSetAtRef.current > 15000) {
            transitionLockRef.current = false;
          } else {
            return;
          }
        }

        const sheetsRes = await getStorySheetsBySession(sessionId);
        const allSheets = sheetsRes || [];
        const dbPlayersRes = await getPlayersBySession(sessionId);
        const livePlayers = (dbPlayersRes && dbPlayersRes.length > 0) ? dbPlayersRes : (players || []);

        if (parsedStoryMode) {
          const amIFinished = livePlayers.find(p => p.id === playerId)?.players_status === 'finished';
          const allFinished = livePlayers.length > 0 && livePlayers.every(p => p.players_status === 'finished');
          if (!amIFinished && currentRoundRef.current > gameLength) {
            transitionLockRef.current = true;
            transitionLockSetAtRef.current = Date.now();
            await fetchFinalStoryResult();
            transitionLockRef.current = false;
          } else if (amIFinished && allFinished && isHost) {
            await updateGameSession(sessionId, { session_status: 'completed' });
          }
          return;
        }

        let answeredCount = 0;
        const currentAnsRes = await getAnswersByRound(currentRoundIdRef.current!);
        const currentAnswersData = currentAnsRes || [];
        answeredCount = currentAnswersData.length;

        if (livePlayers.length > 0 && answeredCount >= livePlayers.length && isHost) {
          if (currentRoundRef.current >= gameLength) {
            transitionLockRef.current = true;
            transitionLockSetAtRef.current = Date.now();
            
            for (const p of livePlayers) {
              const hasAnswered = currentAnswersData.some(a => a.player_id === p.id);
              if (!hasAnswered) {
                const sheet = allSheets.find(s => s.player_id === p.id);
                if (sheet) {
                  await submitAnswer({
                    answer_text: '...',
                    position_in_sheet: currentRoundRef.current,
                    player_id: p.id,
                    round_id: currentRoundIdRef.current!,
                    story_sheet_id: sheet.id
                  });
                }
              }
            }
            await updateGameSession(sessionId, { session_status: 'completed' });
            transitionLockRef.current = false;
            return;
          }

          transitionLockRef.current = true;
          transitionLockSetAtRef.current = Date.now();

          const newRoundNum = currentRoundRef.current + 1;
          for (const p of livePlayers) {
            const hasAnswered = currentAnswersData.some(a => a.player_id === p.id);
            if (!hasAnswered) {
              let targetSheetId = null;
              const sortedPlayers = [...livePlayers].sort((a, b) => String(a.id).localeCompare(String(b.id)));
              const pIndex = sortedPlayers.findIndex(sp => sp.id === p.id);
              if (pIndex !== -1) {
                let targetIndex = (pIndex - (currentRoundRef.current - 1)) % sortedPlayers.length;
                if (targetIndex < 0) targetIndex += sortedPlayers.length;
                const targetPlayerId = sortedPlayers[targetIndex]?.id;
                targetSheetId = allSheets.find(s => s.player_id === targetPlayerId)?.id;
              }

              if (targetSheetId) {
                await submitAnswer({
                  answer_text: '...',
                  position_in_sheet: currentRoundRef.current,
                  player_id: p.id,
                  round_id: currentRoundIdRef.current!,
                  story_sheet_id: targetSheetId
                });
              }
            }
          }

          if (activeTemplate?.id === 'custom_ai') {
            await new Promise(r => setTimeout(r, 6000));
          }

          const newRoundRes = await createRound({
            session_id: sessionId,
            round_number: newRoundNum,
            question_type: 'who',
            rounds_status: 'active',
            started_at: new Date().toISOString()
          });

          setAppState((prev: any) => ({
            ...prev,
            currentRound: newRoundNum,
            currentRoundId: newRoundRes.id,
            roundStartedAt: new Date().toISOString(),
            phase: Phases.Main,
            answeredRoundId: null
          }));

          transitionLockRef.current = false;
        }

      } catch (e: any) {
        console.error("Polling error", e);
        setAppState((prev: any) => ({ ...prev, error: "Transition Error: " + (e.message || String(e)) }));
        transitionLockRef.current = false;
      }
    }, 1500);

    return () => clearInterval(transitionInterval);
  }, [
    sessionId, didGameStart, isHost, parsedStoryMode, gameLength, 
    players, playerId, activeTemplate, language, customTopic, 
    fetchFinalStoryResult, setAppState
  ]);
};
