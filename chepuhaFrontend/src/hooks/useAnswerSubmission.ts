import { useCallback } from 'react';
import { submitAnswer, updateStorySheetQuestion, getStorySheetsBySession } from '@api';
import { generateNextQuestion, isGroqAvailable } from '../utils/groq';
import { supabase } from '@api/supabaseClient';
import { Phases } from '../types/phaseVariant';

export const useAnswerSubmission = (
  sessionId: string | null,
  playerId: string | null,
  players: any[] | null,
  currentRoundId: string | null,
  currentRound: number,
  myStorySheetId: string | null,
  activeTemplate: any,
  gameLength: number,
  language: string,
  customTopic: string,
  parsedStoryMode: boolean,
  setAppState: any,
  t: any
) => {

  const doAnswerSubmit = useCallback(async (answer: string) => {
    if (!playerId || !currentRoundId) return;

    try {
      const cleanAnswer = answer.trim();
      let targetSheet = myStorySheetId;

      if (!parsedStoryMode) {
        const sheetsRes = await getStorySheetsBySession(sessionId!);
        const safeSheets = sheetsRes.data || [];
        targetSheet = myStorySheetId || safeSheets.find(s => s.player_id === playerId)?.id;

        if (safeSheets.length > 0 && (players || []).length > 0) {
          const sortedPlayers = [...(players || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
          const myIndex = sortedPlayers.findIndex(p => p.id === playerId);
          let targetIndex = (myIndex - (currentRound - 1)) % sortedPlayers.length;
          if (targetIndex < 0) targetIndex += sortedPlayers.length;
          const targetPlayerId = sortedPlayers[targetIndex]?.id;
          targetSheet = safeSheets.find(s => s.player_id === targetPlayerId)?.id || targetSheet;
        }
      }

      await submitAnswer({
        answer_text: cleanAnswer,
        position_in_sheet: currentRound,
        player_id: playerId,
        round_id: currentRoundId,
        story_sheet_id: targetSheet,
      });

      if (!parsedStoryMode && activeTemplate.id === 'custom_ai' && targetSheet && currentRound < gameLength && isGroqAvailable()) {
        (async () => {
          try {
            const [{ data: sheetData }, { data: myData }] = await Promise.all([
                supabase.from('answers').select('answer_text').eq('story_sheet_id', targetSheet).order('position_in_sheet', { ascending: true }),
                supabase.from('answers').select('answer_text').eq('player_id', playerId).order('position_in_sheet', { ascending: true })
            ]);
            const sheetAnswers = (sheetData || []).map(a => a.answer_text);
            const myAnswers = (myData || []).map(a => a.answer_text);
            const roundInfo = { currentRound, gameLength, isSolo: (players || []).length === 1 };
            const nextQ = await generateNextQuestion(customTopic || 'Своя гра', sheetAnswers, myAnswers, roundInfo, language as 'uk' | 'en');
            if (nextQ) {
              await updateStorySheetQuestion(targetSheet, nextQ);
            }
          } catch(e) {
            console.error("AI question error:", e);
          }
        })();
      }

      setAppState((prev: any) => {
        if (parsedStoryMode && prev.currentRound < gameLength) {
          return {
            ...prev,
            userAnswers: [...prev.userAnswers, cleanAnswer],
            phase: Phases.Main,
            currentRound: prev.currentRound + 1,
            answeredRoundId: currentRoundId,
            error: ""
          };
        } else {
          return {
            ...prev,
            userAnswers: [...prev.userAnswers, cleanAnswer],
            answeredRoundId: currentRoundId
          };
        }
      });

    } catch (e) {
      console.error("Failed to submit answer", e);
      setAppState((prev: any) => ({ ...prev, error: t('ERR_GENERIC') || 'Error submitting answer' }));
    }
  }, [
    sessionId, playerId, players, currentRoundId, currentRound, 
    myStorySheetId, activeTemplate, gameLength, language, customTopic, 
    parsedStoryMode, setAppState, t
  ]);

  return { doAnswerSubmit };
};
