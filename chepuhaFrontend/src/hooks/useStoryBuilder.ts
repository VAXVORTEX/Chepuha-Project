import { useCallback } from 'react';
import { getStorySheetsBySession, getAnswersByRound } from '@api';
import ReactDOMServer from 'react-dom/server';
import { generateAIStory, isGroqAvailable, refineStoryWithAI } from '../utils/groq';
import { renderThemedNickname } from '../utils/nickname';
import { Phases } from '../types/phaseVariant';
import { SavedGame } from '../hooks/useHistory';

export const useStoryBuilder = (
  sessionId: string | null,
  players: any[] | null,
  currentAnswers: any[],
  activeTemplate: any,
  gameLength: number,
  language: string,
  t: any,
  setAppState: any,
  saveGameToHistory: (game: SavedGame) => void
) => {

  const fetchFinalStoryResult = useCallback(async () => {
    if (!sessionId || !players) return;
    try {
      const sheetsResponse = await getStorySheetsBySession(sessionId);
      if (!sheetsResponse.data || sheetsResponse.data.length === 0) return;

      const sheets = sheetsResponse.data;
      const sortedPlayers = [...players].sort((a, b) => String(a.id).localeCompare(String(b.id)));
      
      const allPlayerStories = [];

      for (const p of sortedPlayers) {
        const sheet = sheets.find(s => s.player_id === p.id);
        if (!sheet) continue;

        let answers: string[] = [];
        let currentSheetAnswers: any[] = [];
        try {
          const ansData = await getAnswersByRound(sheet.id);
          currentSheetAnswers = (ansData.data || []).sort((a, b) => (a.position_in_sheet || 0) - (b.position_in_sheet || 0));
          answers = currentSheetAnswers.map(a => {
            if (!a) return '...';
            const ap = sortedPlayers.find(pl => pl.id === a.player_id);
            const coloredNick = ap 
              ? ReactDOMServer.renderToStaticMarkup(renderThemedNickname(ap.nickname, ap.color || '#000000', 16, false, true, false, '16px'))
              : '???';
            const answerText = a.answer_text || '...';
            
            if (activeTemplate.id === 'custom_ai') {
                return `<span style="color: ${ap?.color || '#ffffff'};">${answerText}</span>`;
            }
            return `<span class="player-tag">${coloredNick}</span> <b>${answerText}</b>`;
          });
        } catch (e) {
          console.error("Failed to load answers for sheet", sheet.id, e);
        }

        let storyHTML = '';
        if (activeTemplate.id === 'custom_ai') {
          if (answers.length > 0 && isGroqAvailable()) {
            const rawTextAnswers = answers.map(a => a.replace(/<[^>]*>?/gm, '').trim());
            const rawAiStory = await generateAIStory(
              activeTemplate.name,
              rawTextAnswers,
              language as 'uk' | 'en'
            );
            
            let ansIdx = 0;
            storyHTML = rawAiStory.replace(/<ans>(.*?)<\/ans>/gs, (match, innerText) => {
              const aIndex = ansIdx++;
              const originalAnswerObj = currentSheetAnswers[aIndex];
              const p = originalAnswerObj ? sortedPlayers.find(pl => pl.id === originalAnswerObj.player_id) : null;
              const color = p ? p.color : '#ffffff';
              return `<span style="color: ${color}; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-weight: bold;" translate="no" class="notranslate">${innerText}</span>`;
            });
          } else {
            storyHTML = activeTemplate.buildStory(answers);
          }
        } else {
          storyHTML = activeTemplate.buildStory(answers);
          
          if (isGroqAvailable()) {
             try {
                const refined = await refineStoryWithAI(storyHTML, language as 'uk' | 'en');
                if (refined) {
                    storyHTML = refined;
                }
             } catch(e) {
                console.warn("Story refinement failed", e);
             }
          }
        }

        allPlayerStories.push({
          playerName: p.nickname,
          story: storyHTML,
          answers: answers,
          templateId: activeTemplate.id
        });
      }

      const g: SavedGame = {
        id: sessionId,
        date: Date.now(),
        stories: allPlayerStories
      };
      
      saveGameToHistory(g);
      
      setAppState((prev: any) => ({
        ...prev,
        allStories: g.stories,
        storyIndex: 0,
        selectedHistoryGame: g,
        phase: Phases.End
      }));

    } catch (e) {
      console.error("Failed to fetch final results", e);
      setAppState((prev: any) => ({ ...prev, error: t('ERR_GENERIC') || 'Error fetching results' }));
    }
  }, [sessionId, players, activeTemplate, language, t, setAppState, saveGameToHistory]);

  return { fetchFinalStoryResult };
};
