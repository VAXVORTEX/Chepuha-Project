import { useState, useEffect, useCallback, useRef, memo } from "react";
import classNames from "classnames";
import Button from "./components/Button/Button";
import HistoryScreen from "./components/HistoryScreen/HistoryScreen";
import { RoundCard } from "./components/RoundCard/RoundCard";
import GameCode from "./components/GameCode/GameCode";
import "./App.scss";
import { Phases } from "./types/phaseVariant";
import Round from "./components/Round/Round";
import Timer from "./components/Timer/Timer";
import JoinCard from "./components/JoinCard/JoinCard";
import WaitCard from "./components/WaitCard/WaitCard";
import HomeIcon from "./components/HomeIcon/HomeIcon";
import Input from "./components/Input/Input";
import GameInput from "./components/GameInput/GameInput";
import GameResult from "./components/GameResult/GameResult";
import logoImage from "./assets/images/Logo.png";
import logoImageEng from "./assets/images/Chepuha_eng.png";
import crownImage from "./assets/images/crown.png";
import flagUk from "./assets/images/flag_uk.png";
import flagEn from "./assets/images/flag_en.png";
import { useHistory, SavedGame } from "./hooks/useHistory";
import { playSecretMusic, secretAudio } from "./utils/audio";
import { mathProblems } from "./config/mathProblems";
const STATE_STORAGE_KEY = "chepuhaActiveGameState";
import { useGameState } from "./hooks/useGameState";
import { supabase } from "@api/supabaseClient";
import {
  createGameSession,
  getGameSession,
  createPlayer,
  updateGameSession,
  updatePlayer,
  updatePlayersBySession,
  createRound,
  createStorySheetsBatch,
  submitAnswer,
  getAnswersByRound,
  QuestionType,
  StorySheetStatus,
  getGameSessions,
  getStorySheetsBySession,
  getRoundsBySession,
  getPlayersBySession,
  updateStorySheetQuestion,
} from "@api";
import { TEMPLATES } from "./config/templates";
import { useLanguage } from "./contexts/LanguageContext";
import { Player } from "@api/types";
import { renderThemedNickname, getFontSize, getNicknameStyle, getNicknameClassName } from "./utils/nickname";
import ReactDOMServer from 'react-dom/server';
import { generateAIStory, isGroqAvailable, refineStoryWithAI, generateCustomQuestions, generateNextQuestion } from './utils/groq';

// --- NEW IMPORTS ---
import { useServerTimeOffset } from './hooks/useServerTimeOffset';
import { useLobbyTimer } from './hooks/useLobbyTimer';
import { useCarousel } from './hooks/useCarousel';
import { usePlayerColor } from './hooks/usePlayerColor';
import { useStoryBuilder } from './hooks/useStoryBuilder';
import { useAnswerSubmission } from './hooks/useAnswerSubmission';
import { useRoundTransitions } from './hooks/useRoundTransitions';
import { AVAILABLE_COLORS } from './config/colors';
import { GAME_LENGTH_INDICES } from './config/gameSettings';
import MainMenu from './components/MainMenu/MainMenu';
import CreateGameScreen from './components/CreateGameScreen/CreateGameScreen';
import LobbyScreen from './components/LobbyScreen/LobbyScreen';
import PlayerList from './components/PlayerList/PlayerList';
import CustomTopicModal from './components/CustomTopicModal/CustomTopicModal';
// -------------------


export interface AppState {
  phase: Phases;
  didGameStart: boolean;
  currentRound: number;
  userAnswers: string[];
  isCreatingLobby: boolean;
  isLobby: boolean;
  nickname: string;
  roomCode: string;
  selectedTemplate: string;
  error: string;
  allStories: { playerName: string; story: string; answers?: string[]; templateId?: string }[];
  storyIndex: number;
  selectedHistoryGame: SavedGame | null;
  joinedCount: number;
  totalCount: number;
  sessionId: string | null;
  playerId: string | null;
  isHost: boolean;
  currentRoundId: string | null;
  myStorySheetId: string | null;
  playerCount: number;
  roundStartedAt: string | null;
  allStorySheets: { playerId: string, sheetId: string, current_ai_question?: string | null }[];
  lobbyCreatedAt: number | null;
  answeredRoundId: string | null;
  isJoining: boolean;
  gameLength: 6 | 9 | 12;
  storyMode: boolean;
  hintsEnabled: boolean;
  colorHighlight: boolean;
  playerColor: string;
}

const getInitialState = (): AppState => {
  const defaultState: AppState = {
    phase: Phases.Main,
    didGameStart: false,
    currentRound: 1,
    userAnswers: [],
    isCreatingLobby: false,
    isLobby: false,
    nickname: '',
    roomCode: '',
    selectedTemplate: "classic",
    error: "",
    allStories: [],
    storyIndex: 0,
    selectedHistoryGame: null,
    joinedCount: 0,
    totalCount: 0,
    sessionId: null,
    playerId: null,
    isHost: false,
    currentRoundId: null,
    myStorySheetId: null,
    playerCount: 0,
    roundStartedAt: null,
    allStorySheets: [],
    lobbyCreatedAt: null,
    answeredRoundId: null,
    isJoining: false,
    gameLength: 9,
    storyMode: false,
    hintsEnabled: false,
    colorHighlight: true,
    playerColor: '',
  };

  try {
    const prefs = localStorage.getItem('chepuhaUserPrefs');
    if (prefs) {
      const p = JSON.parse(prefs);
      defaultState.nickname = p.nickname || '';
      defaultState.roomCode = p.roomCode || '';
      if (p.gameLength !== undefined) defaultState.gameLength = p.gameLength;
      if (p.storyMode !== undefined) defaultState.storyMode = p.storyMode;
      if (p.hintsEnabled !== undefined) defaultState.hintsEnabled = p.hintsEnabled;
      if (p.colorHighlight !== undefined) defaultState.colorHighlight = p.colorHighlight;
    }

    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {


        return {
          ...defaultState,
          sessionId: parsed.sessionId || null,
          playerId: parsed.playerId || null,
          nickname: parsed.nickname || defaultState.nickname,
          roomCode: parsed.roomCode || defaultState.roomCode,
          isHost: parsed.isHost || false,
          selectedTemplate: parsed.selectedTemplate || "classic",
          answeredRoundId: parsed.answeredRoundId || null,
          currentRoundId: parsed.currentRoundId || null,
          currentRound: parsed.currentRound || 1,
          roundStartedAt: parsed.roundStartedAt || null,
          gameLength: parsed.gameLength || 9,
          storyMode: parsed.storyMode || false,
          hintsEnabled: parsed.hintsEnabled || false,
          colorHighlight: true,
          playerColor: parsed.playerColor || AVAILABLE_COLORS[0],
        };
      }
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }

  return defaultState;
};

const safeApiCall = async (apiFunc: any, payload: any) => {
  try {
    return await apiFunc(payload);
  } catch (err: any) {

    if (err && (String(err.message).includes('column') || String(err.message).includes('schema cache'))) {
      const { color, ...fallbackPayload } = (payload || {});
      console.warn("Retrying API call without 'color' column due to DB error:", err.message);
      return await apiFunc(fallbackPayload);
    }
    throw err;
  }
};

function App() {
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const serverTimeOffset = useServerTimeOffset();
  const playersListRef = useRef<HTMLDivElement>(null);
  const [logoPop, setLogoPop] = useState(false);

  const triggerLogoPop = () => {
    setLogoPop(true);
    playSecretMusic();
  };

  const { phase, didGameStart, currentRound, userAnswers, isCreatingLobby, isLobby, nickname, roomCode, selectedTemplate, error, allStories, storyIndex, selectedHistoryGame, joinedCount, totalCount, sessionId, playerId, isHost, currentRoundId, myStorySheetId, playerCount, roundStartedAt, allStorySheets, lobbyCreatedAt, answeredRoundId, gameLength, storyMode, hintsEnabled, colorHighlight, playerColor } = appState;
  const { session, players, rounds, currentAnswers, activeRoundId: hookActiveRoundId, error: pollError, refreshState, dataReady } = useGameState(sessionId);

  useEffect(() => {
    if (players && players.length > 0 && playerId && playersListRef.current && isLobby) {

      const myItem = playersListRef.current.querySelector(`[data-player-id="${playerId}"]`);
      if (myItem) {
        myItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [players?.length, playerId, isLobby]);
  const hookMatch = hookActiveRoundId && currentRoundId && hookActiveRoundId === currentRoundId;
  const rawTemplateConfig = session?.template || selectedTemplate || "";
  const tParts = rawTemplateConfig.split('|');
  const actualTemplateKey = tParts[0] || 'classic';
  const parsedGameLength = tParts[1] ? (parseInt(tParts[1], 10) as 6 | 9 | 12) : gameLength;
  const parsedStoryMode = tParts[2] ? tParts[2] === '1' : storyMode;
  const parsedHintsEnabled = tParts[3] ? tParts[3] === '1' : hintsEnabled;
  const parsedColorHighlight = tParts[4] ? tParts[4] === '1' : colorHighlight;

  const derivedTotalCount = totalCount > 0 ? totalCount : (players?.length || 0);
  const finishedCount = (players || []).filter(p => p.players_status === 'finished').length;
  const derivedJoinedCount = parsedStoryMode
    ? finishedCount
    : Math.min(
      Math.max(joinedCount, currentAnswers.length),
      derivedTotalCount > 0 ? derivedTotalCount : Infinity
    );

  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language || 'uk';
  }, [language]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);
  const transitionLockSetAtRef = useRef<number>(0);
  const currentRoundIdRef = useRef(currentRoundId);
  const currentRoundRef = useRef(currentRound);

  let activeTemplate = TEMPLATES[actualTemplateKey] || TEMPLATES.classic;
  if (actualTemplateKey === 'custom_ai' && tParts.length > 5) {
      const q = tParts.slice(6);
      activeTemplate = {
          id: 'custom_ai',
          name: tParts[5] || 'custom_ai',
          questionTypes: q,
          questions: q,
          fallbacks: Array(12).fill(['...']),
          buildStory: (answers: string[]) => {
              const filtered = answers.filter(a => a && a !== '__REMOVE_ME__' && a.trim());
              if (filtered.length === 0) return 'Історія не була згенерована.';
              return filtered.join('. ') + '.';
          }
      } as any;
  }
  const { savedGames, saveGameToHistory } = useHistory();


  const { carouselIndex, setCarouselIndex, moveCarousel: moveCarouselHook, CAROUSEL_TEMPLATES } = useCarousel();
  const carouselRef = useRef<HTMLDivElement>(null);
  const moveCarousel = (dir: 1 | -1) => moveCarouselHook(dir, setAppState);

  const { cycleColor: cycleColorHook } = usePlayerColor();
  const cycleColor = (direction: -1 | 1) => cycleColorHook(direction, playerId, players || [], setAppState);


  const touchStartY = useRef<number>(0);
  const handleCarouselTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleCarouselTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 30) moveCarousel(delta > 0 ? 1 : -1);
  };


  const handleCarouselWheel = (e: React.WheelEvent) => {
    moveCarousel(e.deltaY > 0 ? 1 : -1);
  };

  useEffect(() => {
    if (sessionId && playerId && nickname) {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({
        sessionId,
        playerId,
        nickname,
        roomCode,
        isHost,
        selectedTemplate,
        answeredRoundId,
        currentRoundId,
        currentRound,
        didGameStart,
        phase,
        roundStartedAt,
        gameLength,
        storyMode,
        hintsEnabled,
        colorHighlight,
        playerColor,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(STATE_STORAGE_KEY);
    }
  }, [sessionId, playerId, nickname, roomCode, isHost, selectedTemplate, answeredRoundId, currentRoundId, currentRound, didGameStart, phase, roundStartedAt, gameLength, storyMode, hintsEnabled, colorHighlight, playerColor]);


  useEffect(() => {
    if (isHost && sessionId && isLobby && session) {
      let packedTemplate = `${selectedTemplate}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;
      
      if (selectedTemplate === 'custom_ai' && session.template) {
        const parts = session.template.split('|');
        if (parts.length > 5) {
          packedTemplate += '|' + parts.slice(5).join('|');
        }
      }

      if (session.template && packedTemplate !== session.template) {
        updateGameSession(sessionId, { template: packedTemplate }).catch(err => {
          console.error("Failed to update game session template:", err);
        });
      }
    }
  }, [isHost, sessionId, isLobby, selectedTemplate, gameLength, storyMode, hintsEnabled, colorHighlight, session]);


  useEffect(() => {
    if (sessionId && playerId && playerColor) {
      updatePlayer(playerId, { color: playerColor }).catch((err) => {
        if (String(err.message).includes('column') || String(err.message).includes('schema cache')) {
        } else {
          console.error("Failed to update player color sync:", err);
        }
      });
    }
  }, [sessionId, playerId, playerColor]);

  useEffect(() => {
    if (nickname || roomCode || gameLength || storyMode || hintsEnabled || colorHighlight) {
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ 
        nickname, 
        roomCode,
        gameLength,
        storyMode,
        hintsEnabled,
        colorHighlight
      }));
    }
  }, [nickname, roomCode, gameLength, storyMode, hintsEnabled, colorHighlight]);

  useEffect(() => {
    const imagesToPreload = [
      logoImage, logoImageEng, crownImage, flagUk, flagEn,
      "/assets/images/main_character_yellow.png",
      "/assets/images/main_character_red.png",
      "/assets/images/gameBackground.jpg"
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    playSecretMusic();
    setTimeout(() => {
      if (secretAudio && !secretAudio.paused) secretAudio.pause();
    }, 50);
  }, []);

  const fetchFinalStoryResult = useCallback(async () => {
    if (!sessionId) return;
    try {
      const sheets = await getStorySheetsBySession(sessionId);
      const built = await Promise.all((sheets || [])

        .map(async s => {
          try {
            const sorted = [...(s.answers || [])].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
          const p = s.player_id as any;

          const sheetOwnerId = typeof s.player_id === 'object' && s.player_id !== null ? s.player_id.id : s.player_id;
          const ownerFromList = players.find(p => String(p.id) === String(sheetOwnerId));
          const nick = p?.nickname || ownerFromList?.nickname || 'Гравець';
          const pAnswers = sorted.map(a => a.answer_text);

          const indices = GAME_LENGTH_INDICES[gameLength] || GAME_LENGTH_INDICES[12];
          const fullAnswers = Array(12).fill("");
          indices.forEach((qIndex, i) => {
            if (pAnswers[i]) fullAnswers[qIndex] = pAnswers[i];
          });
          for (let i = 0; i < 12; i++) {
            if (!fullAnswers[i]) {
              if (indices.includes(i)) {
                const fbArr = (language === 'en' && activeTemplate.fallbacksEn) ? activeTemplate.fallbacksEn : activeTemplate.fallbacks;
                const pool = fbArr[i] || ["..."];
                const hashStr = String(sessionId || "") + String(sheetOwnerId) + i;
                let hash = 0;
                for (let k = 0; k < hashStr.length; k++) hash += hashStr.charCodeAt(k);
                fullAnswers[i] = pool[hash % pool.length];
              } else {
                fullAnswers[i] = "__REMOVE_ME__";
              }
            }
          }

          const coloredAnswers = fullAnswers.map((ans, idx) => {
            if (!parsedColorHighlight) {
              if (ans === "__REMOVE_ME__") return ans;
              return `<span style="color: #8B0000; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px rgba(0,0,0,0.5); -webkit-text-stroke: 0.5px #000;">${ans}</span>`;
            }
            const roundIndex = indices.indexOf(idx);
            const originalAnswer = roundIndex !== -1
              ? (s.answers || []).find((a: any) => a.position_in_sheet === (roundIndex + 1))
              : null;


            if (!originalAnswer) {
              if (ans === "__REMOVE_ME__") return ans;
              return `<span lang="uk" style="color: #ffffff; text-shadow: none; -webkit-text-stroke: none;">${ans}</span>`;
            }
            const ansOwnerId = typeof originalAnswer.player_id === 'object' && originalAnswer.player_id !== null ? originalAnswer.player_id.id : originalAnswer.player_id;
            const ansOwner = typeof originalAnswer.player_id === 'object' && originalAnswer.player_id !== null ? originalAnswer.player_id : players.find(p => String(p.id) === String(ansOwnerId));
            const color = ansOwner?.color || (String(ansOwnerId) === String(playerId) ? (playerColor || '#8B0000') : '#8B0000');

            return ReactDOMServer.renderToStaticMarkup(
              renderThemedNickname(ans, color, 24, true, true)
            );
          });

          const sheetOwner = players.find(p => String(p.id) === String(sheetOwnerId));
          const sheetOwnerColor = sheetOwner?.color || (String(sheetOwnerId) === String(playerId) ? (playerColor || '#ffffff') : '#ffffff');

          const isAIMode = actualTemplateKey === 'custom_ai';

          const seedStr = String(sessionId || "") + String(sheetOwnerId);
          let storySeed = 0;
          for (let k = 0; k < seedStr.length; k++) {
            storySeed = ((storySeed << 5) - storySeed) + seedStr.charCodeAt(k);
            storySeed |= 0;
          }
          storySeed = Math.abs(storySeed);

          let storyText: string;
          if (isAIMode && isGroqAvailable()) {
            try {
              storyText = await generateAIStory(
                fullAnswers.filter(a => a && a.trim() && !a.includes('__REMOVE_ME__')),
                isAIMode ? activeTemplate.name : t('GENERAL'),
                language as 'uk' | 'en',
                storySeed
              );
              // Convert <ans>...</ans> tags to colored spans
              if (parsedColorHighlight) {
                let ansIdx = 0;
                const usedAnswers = fullAnswers.filter(a => a && a.trim() && !a.includes('__REMOVE_ME__'));
                storyText = storyText.replace(/<ans>(.*?)<\/ans>/g, (_, ansText) => {
                  const origIdx = indices[ansIdx % indices.length];
                  const originalAnswer = (s.answers || []).find((a: any) => a.position_in_sheet === (ansIdx + 1));
                  const ansOwnerId = originalAnswer ? (typeof originalAnswer.player_id === 'object' && originalAnswer.player_id !== null ? originalAnswer.player_id.id : originalAnswer.player_id) : null;
                  const ansOwner = ansOwnerId ? (typeof originalAnswer.player_id === 'object' && originalAnswer.player_id !== null ? originalAnswer.player_id : players.find(p => String(p.id) === String(ansOwnerId))) : null;
                  const color = ansOwner?.color || (String(ansOwnerId) === String(playerId) ? (playerColor || '#8B0000') : '#8B0000');
                  ansIdx++;
                  return ReactDOMServer.renderToStaticMarkup(
                    renderThemedNickname(ansText, color, 24, true, true)
                  );
                });
              } else {
                storyText = storyText.replace(/<ans>(.*?)<\/ans>/g, (_, ansText) => {
                  return `<span style="color: #8B0000; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px rgba(0,0,0,0.5); -webkit-text-stroke: 0.5px #000;">${ansText}</span>`;
                });
              }
              // Clean any remaining <ans> tags that weren't matched
              storyText = storyText.replace(/<\/?ans>/g, '');
            } catch (aiErr) {
              console.warn('[Chepuha] AI story generation failed, using template fallback:', aiErr);
              storyText = activeTemplate.buildStory(coloredAnswers, language, String(sessionId || 'local'), String(sessionId || 'local'));
              if (storyText.includes("__REMOVE_ME__")) {
                storyText = storyText.replace(/[^.!?]*__REMOVE_ME__[^.!?]*([.!?]\s*|$)/g, '').trim();
              }
            }
          } else {
            storyText = activeTemplate.buildStory(coloredAnswers, language, String(sessionId || 'local'), String(sessionId || 'local'));
            if (storyText.includes("__REMOVE_ME__")) {
              storyText = storyText.replace(/[^.!?]*__REMOVE_ME__[^.!?]*([.!?]\s*|$)/g, '').replace(/\s+/g, ' ').trim();
            }
            if (isGroqAvailable()) {
               try {
                  storyText = await refineStoryWithAI(storyText, language as 'uk' | 'en', storySeed);
               } catch (aiErr) {
                  console.warn('[Chepuha] AI refinement failed:', aiErr);
               }
            }
          }

          return {
            playerName: nick,
            story: storyText,
            answers: fullAnswers,
            templateId: isAIMode ? 'classic' : activeTemplate.id,
            playerColor: sheetOwnerColor
          };
        } catch (innerErr) {
          console.error('[Chepuha] Error building story for sheet:', innerErr);
          return {
            playerName: 'Unknown',
            story: 'Error generating story',
            answers: [],
            templateId: 'classic',
            playerColor: '#ffffff'
          };
        }
        })
      );
      
      if (built.length > 0) {
        // Sort deterministically (e.g., by player order or name) so all players see the same "first" story
        built.sort((a, b) => a.playerName.localeCompare(b.playerName));
        
        setAppState(prev => ({ ...prev, allStories: built, storyIndex: 0 }));

        const hostPlayer = players.find(p => p.player_order === 1) || players[0];
        const hostName = hostPlayer ? hostPlayer.nickname : 'Невідомо';
        const date = new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const gameRoomCode = session?.session_name || roomCode || 'Невідомо';
        saveGameToHistory({
          sessionId: sessionId,
          date,
          roomCode: gameRoomCode,
          hostName,
          hostColor: hostPlayer?.color || '#000',
          stories: built
        });
      }
    } catch (err) {
      console.error("Error fetching final story result:", err);
    }
  }, [sessionId, players, session, roomCode, language, activeTemplate, parsedColorHighlight, playerId, playerColor, gameLength]);

  useEffect(() => {
    if (!didGameStart || !playerId || !sessionId) return;
    if (!dataReady) return;
    if (isHost && (isTransitioning || transitionLockRef.current)) return;

    const sorted = [...(rounds || [])].sort((a: any, b: any) => b.round_number - a.round_number);
    const latestRound = sorted[0];
    const myPlayer = players.find(p => p.id === playerId);

    if (!latestRound || !myPlayer) return;

    const isStory = parsedStoryMode;

    if ((latestRound.round_number > currentRound || !currentRoundId) && !isStory) {
      let newPhase = Phases.Main;

      if (currentAnswers.some(a => {
        const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
        const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
        return String(aPlayerId) === String(playerId) && String(aRoundId) === String(latestRound.id);
      }) || (String(answeredRoundId) === String(latestRound.id))) {
        newPhase = Phases.Waiting;
      }

      currentRoundIdRef.current = latestRound.id;
      currentRoundRef.current = latestRound.round_number;
      setAppState(prev => ({
        ...prev,
        currentRoundId: latestRound.id,
        currentRound: latestRound.round_number,
        roundStartedAt: latestRound.started_at || prev.roundStartedAt,
        phase: newPhase,
        joinedCount: 0,
        answeredRoundId: newPhase === Phases.Waiting ? latestRound.id : null
      }));
      refreshState();
    }
    if (String(latestRound.id) === String(currentRoundId) || isStory) {
      if (session?.session_status === 'completed' && phase !== Phases.End && phase !== Phases.History) {

        if (!transitionLockRef.current) {
          fetchFinalStoryResult();
          setAppState(prev => ({ ...prev, phase: Phases.End }));
        }
      } else if (phase === Phases.Main && !isStory && (currentAnswers.some(a => {
        const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
        const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
        return String(aPlayerId) === String(playerId) && String(aRoundId) === String(currentRoundId);
      }) || String(answeredRoundId) === String(currentRoundId))) {
        setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      }
    }
  }, [didGameStart, playerId, players, phase, sessionId, currentRound, currentRoundId, currentAnswers, rounds, isTransitioning, fetchFinalStoryResult, dataReady, answeredRoundId, refreshState, isHost]);

  useEffect(() => {
    if (!session || !sessionId || !playerId) return;
    if (!dataReady) return;

    if (session.session_status === 'active' && isLobby && !didGameStart) {
      const sorted = [...(rounds || [])].sort((a: any, b: any) => b.round_number - a.round_number);
      const latestRound = sorted[0];
      let initialPhase = Phases.Main;
      let initAnsweredId: string | null = null;

      if (latestRound) {
        const hasAnswered = currentAnswers.some(a =>
          (typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : String(a.player_id)) === playerId &&
          (typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : String(a.round_id)) === latestRound.id
        );
        if (hasAnswered) {
          initialPhase = parsedStoryMode ? Phases.Main : Phases.Waiting;
          initAnsweredId = latestRound.id;
        }
      }


      let targetRound = latestRound;
      let targetRoundNumber = latestRound?.round_number || 1;
      if (parsedStoryMode && (rounds || []).length > 0) {

        const playerAnswers = (currentAnswers || []).filter(a =>
          (typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : String(a.player_id)) === playerId
        );
        const answeredRoundNumbers = new Set(playerAnswers.map(a => {
          const r = (rounds || []).find(r => r.id === (typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : String(a.round_id)));
          return r?.round_number;
        }).filter(Boolean));

        const firstUnanswered = [...(rounds || [])].sort((a, b) => a.round_number - b.round_number).find(r => !answeredRoundNumbers.has(r.round_number));
        if (firstUnanswered) {
          targetRound = firstUnanswered;
          targetRoundNumber = firstUnanswered.round_number;
        }
      }

      setAppState(prev => ({
        ...prev,
        didGameStart: true,
        isLobby: false,
        phase: initialPhase,
        currentRoundId: targetRound?.id || prev.currentRoundId,
        currentRound: targetRoundNumber,
        roundStartedAt: targetRound?.started_at || prev.roundStartedAt,
        answeredRoundId: initAnsweredId
      }));
      refreshState();
    }
  }, [session?.session_status, isLobby, didGameStart, sessionId, playerId, rounds, currentAnswers, dataReady, refreshState]);

  useEffect(() => {
    if (!session || session.session_status !== 'active' || !sessionId || !playerId) return;

    (async () => {
      try {
        const sheets = await getStorySheetsBySession(sessionId);

        if (Array.isArray(sheets) && sheets.length > 0) {
          setAppState(prev => ({ ...prev, allStorySheets: sheets.map((s: any) => ({ playerId: s.player_id?.id || s.player_id, sheetId: s.id, current_ai_question: s.current_ai_question })) }));
        }

        const mySheet = (sheets || []).find((s: any) => (s.player_id?.id || s.player_id) === playerId);
        if (mySheet) setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
        if (players.length > 0) setAppState(prev => ({ ...prev, playerCount: players.length }));
      } catch (err) {
      }
    })();
  }, [session?.session_status, sessionId, playerId, players.length, refreshState, currentRound]);

  useEffect(() => { currentRoundIdRef.current = currentRoundId; }, [currentRoundId]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setAppState(prev => ({ ...prev, error: "" })), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const goHome = useCallback(() => {
    setShowCustomPrompt(false);
    setAppState(prev => ({
      ...prev,
      phase: Phases.Main,
      didGameStart: false,
      isCreatingLobby: false,
      isLobby: false,
      isJoining: false,
      error: "",
      currentRound: 1,
      userAnswers: [],
      sessionId: null,
      playerId: null,
      isHost: false,
      currentRoundId: null,
      myStorySheetId: null,
      selectedHistoryGame: null,
      lobbyCreatedAt: null,
      roomCode: "",
      joinedCount: 0,
      totalCount: 0,
      playerCount: 0,
      allStorySheets: [],
      allStories: [],
      playerColor: "",
    }));
    localStorage.removeItem(STATE_STORAGE_KEY);
  }, [setAppState]);

  const lobbyTimeLeft = useLobbyTimer(isLobby, session?.session_created_at || null, lobbyCreatedAt || null, serverTimeOffset, goHome, setAppState);

  useRoundTransitions(
    sessionId,
    isHost,
    didGameStart,
    currentRound,
    gameLength,
    parsedStoryMode,
    players,
    playerId,
    currentRoundId,
    answeredRoundId,
    activeTemplate,
    language as string,
    customTopic,
    fetchFinalStoryResult,
    setAppState
  );

  const generateRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };



  const doShowCreateScreen = () => {
    localStorage.removeItem(STATE_STORAGE_KEY);
    setShowCustomPrompt(false);
    setAppState(prev => ({
      ...prev,
      roomCode: generateRoomCode(),
      isCreatingLobby: true,
      isLobby: false,
      isJoining: false,
      sessionId: null,
      playerId: null,
      isHost: false,
      didGameStart: false,
      phase: Phases.Main,
      currentRound: 1,
      currentRoundId: null,
      answeredRoundId: null,
      myStorySheetId: null,
      joinedCount: 0,
      totalCount: 0,
      playerCount: 0,
      allStorySheets: [],
      allStories: [],
      error: "",
      playerColor: ""
    }));
  };

  const handleNicknameChange = useCallback((value: string) => {
    if (value.length <= 25) {
      setAppState(prev => ({ ...prev, nickname: value, error: "" }));
      localStorage.setItem('chepuha_nickname', value);
    } else {
      setAppState(prev => ({ ...prev, error: String(t('ERR_NICK_LONG' as any)) }));
    }
  }, [t]);

  const goToLobby = async () => {
    if (!nickname || !nickname.trim()) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_NICKNAME' as any)) }));
      return;
    }
    
    const currentTemplate = CAROUSEL_TEMPLATES[carouselIndex];
    if (currentTemplate === 'custom_ai') {
      setShowCustomPrompt(true);
      return;
    }

    try {
      let templateToSave = currentTemplate;
      if (templateToSave === 'random') {
        const tKeys = Object.keys(TEMPLATES);
        templateToSave = tKeys[Math.floor(Math.random() * tKeys.length)];
      }

      const isAIMode = selectedTemplate === 'custom_ai';
      const packedTemplate = `${templateToSave}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;

      const newSession = await createGameSession({
        session_name: roomCode,
        max_players: 12,
        session_status: 'waiting',
        template: packedTemplate,
      });
      setAppState(prev => ({ ...prev, sessionId: newSession.id, selectedTemplate: templateToSave }));

      const hostColor = AVAILABLE_COLORS[0];
      const hostPlayer = await safeApiCall(createPlayer, {
        nickname,
        session_id: newSession.id,
        players_status: 'joined',
        player_order: 1,
        color: hostColor,
      });
      setAppState(prev => ({
        ...prev,
        playerId: hostPlayer.id,
        playerColor: hostColor,
        isHost: true,
        isLobby: true,
        roomCode: roomCode,
        lobbyCreatedAt: Date.now()
      }));
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ nickname, roomCode }));
      await refreshState();
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_CREATE' as any)) + err.message }));
    }
  };

  const handleCustomTopicSubmit = async () => {
    if (!customTopic.trim()) return;
    setIsGeneratingQuestions(true);
    setAppState(prev => ({ ...prev, error: "" }));
    try {
      const questions = await generateCustomQuestions(customTopic, gameLength, language as 'uk' | 'en');
      
      const packedTemplate = `custom_ai|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}|${customTopic}|${questions.join('|')}`;

      const newSession = await createGameSession({
        session_name: roomCode,
        max_players: 12,
        session_status: 'waiting',
        template: packedTemplate,
      });
      setAppState(prev => ({ ...prev, sessionId: newSession.id, selectedTemplate: 'custom_ai' }));

      const hostColor = AVAILABLE_COLORS[0];
      const hostPlayer = await safeApiCall(createPlayer, {
        nickname,
        session_id: newSession.id,
        players_status: 'joined',
        player_order: 1,
        color: hostColor,
      });
      setAppState(prev => ({
        ...prev,
        playerId: hostPlayer.id,
        playerColor: hostColor,
        isHost: true,
        isLobby: true,
        lobbyCreatedAt: Date.now()
      }));
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ nickname, roomCode }));
      await refreshState();
      
      setShowCustomPrompt(false);
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_CREATE' as any)) + err.message }));
    } finally {
      setIsGeneratingQuestions(false);
    }
  };


  const doShowJoinScreen = () => {
    localStorage.removeItem(STATE_STORAGE_KEY);
    setAppState(prev => ({
      ...prev,
      phase: Phases.Join,
      didGameStart: false,
      sessionId: null,
      playerId: null,
      isHost: false,
      answeredRoundId: null,
      isCreatingLobby: false,
      error: "",
      playerColor: ""
    }));
  };

  const handleJoinGame = async (nick: string, code: string) => {
    if (appState.isJoining) return;
    const joinStartTime = Date.now();
    setAppState(prev => ({ ...prev, isJoining: true, error: "" }));
    try {
      const allSessions = await getGameSessions();
      const targetSession = allSessions.find(s => s.session_name === code && s.session_status !== 'completed');
      if (!targetSession) {
        return setAppState(prev => ({ ...prev, isJoining: false, error: String(t('ERR_NOT_FOUND' as any)) }));
      }


      setAppState(prev => ({ ...prev, nickname: nick, roomCode: code }));

      const existingPlayers = await getPlayersBySession(targetSession.id);
      const existingPlayer = existingPlayers.find((p: Player) => p.nickname.toLowerCase() === nick.toLowerCase());

      if (targetSession.session_status === 'active' && !existingPlayer) {
        return setAppState(prev => ({ ...prev, isJoining: false, error: String(t('ERR_NOT_FOUND' as any)) }));
      }

      if (existingPlayer) {
        let rejoinPhase = Phases.Main;
        let rejoinRoundId: string | null = null;
        let rejoinAnsweredId: string | null = null;
        let rejoinStartedAt: string | null = null;
        let rejoinRound = 1;

        if (targetSession.session_status === 'active') {
          const sessionRounds = await getRoundsBySession(targetSession.id);
          const sorted = [...(sessionRounds || [])].sort((a: any, b: any) => b.round_number - a.round_number);
          const latestRound = sorted[0];

          if (latestRound) {
            rejoinRoundId = latestRound.id;
            rejoinRound = latestRound.round_number;
            rejoinStartedAt = latestRound.started_at;

            const answers = await getAnswersByRound(latestRound.id);
            const hasAnswered = answers.some((a: any) =>
              String(a.player_id?.id || a.player_id) === String(existingPlayer.id)
            );

            rejoinPhase = hasAnswered ? Phases.Waiting : Phases.Main;
            if (hasAnswered) rejoinAnsweredId = latestRound.id;
          }
        }


        const finishJoin = () => {
          setAppState(prev => ({
            ...prev,
            sessionId: targetSession.id,
            playerId: existingPlayer.id,
            isHost: existingPlayer.player_order === 1,
            isLobby: targetSession.session_status === 'waiting',
            didGameStart: targetSession.session_status === 'active',
            phase: rejoinPhase,
            currentRoundId: rejoinRoundId,
            answeredRoundId: rejoinAnsweredId,
            roundStartedAt: rejoinStartedAt,
            currentRound: rejoinRound,
            nickname: nick,
            roomCode: code,
            isCreatingLobby: false,
            isJoining: false,
            gameLength: targetSession.template ? (parseInt(targetSession.template.split('|')[1]) as 6 | 9 | 12) : 9,
            selectedTemplate: targetSession.template ? targetSession.template.split('|')[0] : prev.selectedTemplate,
            storyMode: targetSession.template ? targetSession.template.split('|')[2] === '1' : false,
            hintsEnabled: targetSession.template ? targetSession.template.split('|')[3] === '1' : true,
            colorHighlight: targetSession.template ? targetSession.template.split('|')[4] === '1' : true,
            playerColor: existingPlayer.color || (appState.playerColor && appState.playerColor !== '' ? appState.playerColor : AVAILABLE_COLORS[0]),
          }));
          refreshState();
        };
        finishJoin();
      } else {
        const currentLocalColor = appState.playerColor;
        const takenColors = (existingPlayers || []).map((p: Player) => p.color?.toLowerCase()).filter(Boolean);
        const availableUnique = AVAILABLE_COLORS.filter(c => !takenColors.includes(c.toLowerCase()));

        let guestColor = availableUnique.length > 0 ? availableUnique[0] : AVAILABLE_COLORS[0];
        if (currentLocalColor && !takenColors.includes(currentLocalColor.toLowerCase())) {
          guestColor = currentLocalColor;
        }

        const guest = await safeApiCall(createPlayer, {
          nickname: nick,
          session_id: targetSession.id,
          players_status: 'joined',
          color: guestColor,
        });
        const finishJoinNew = () => {
          setAppState(prev => ({
            ...prev,
            sessionId: targetSession.id,
            playerId: guest.id,
            isHost: false,
            isLobby: true,
            didGameStart: false,
            phase: Phases.Main,
            nickname: nick,
            roomCode: code,
            isCreatingLobby: false,
            isJoining: false,
            gameLength: targetSession.template ? (parseInt(targetSession.template.split('|')[1]) as 6 | 9 | 12) : 9,
            selectedTemplate: targetSession.template ? targetSession.template.split('|')[0] : prev.selectedTemplate,
            storyMode: targetSession.template ? targetSession.template.split('|')[2] === '1' : false,
            hintsEnabled: targetSession.template ? targetSession.template.split('|')[3] === '1' : true,
            colorHighlight: targetSession.template ? targetSession.template.split('|')[4] === '1' : true,
            playerColor: guest.color || guestColor,
          }));
          refreshState();
        };
        finishJoinNew();
      }
    } catch (err: any) {
      setAppState(prev => ({
        ...prev,
        isJoining: false,
        error: String(t('ERR_JOIN' as any)) + err.message
      }));
    }
  };

  const doGameStart = async () => {
    if (!sessionId) return;
    
    // Ping Hugging Face space with the base voice to wake it up and load Silero
    fetch(`https://kikk22320-chepuha-tts.hf.space/tts?text=а&voice=mykyta`).catch(() => {});
    
    try {
      let gameTemplate = activeTemplate;
      let finalTemplateKey = selectedTemplate;
      
      if (selectedTemplate === 'random') {
        const keys = Object.keys(TEMPLATES);
        finalTemplateKey = keys[Math.floor(Math.random() * keys.length)];
        gameTemplate = TEMPLATES[finalTemplateKey];
      }
      
      let packed = `${finalTemplateKey}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;
      
      if (selectedTemplate === 'custom_ai' && session?.template && session.template.startsWith('custom_ai|')) {
        const parts = session.template.split('|');
        if (parts.length > 5) {
          packed = `${finalTemplateKey}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}|${parts.slice(5).join('|')}`;
        }
      }
      
      await updateGameSession(sessionId, { template: packed });

      let initialAiQuestion = "";
      if (selectedTemplate === 'custom_ai' && isGroqAvailable()) {
         try {
             const tGeneral = t('GENERAL') as string;
             initialAiQuestion = await generateNextQuestion(
                 customTopic || tGeneral || 'Своя гра', 
                 [], 
                 [], 
                 { currentRound: 1, gameLength, isSolo: players.length === 1 }, 
                 language as 'uk'|'en'
             );
         } catch(e) {
             console.error("Failed to generate initial AI question:", e);
         }
      }

      const sheetsToCreate = players.map(p => ({
        game_session_id: sessionId,
        player_id: p.id,
        storysheets_status: 'in_progress' as StorySheetStatus,
        current_ai_question: initialAiQuestion
      }));

      const createdSheets = await createStorySheetsBatch(sheetsToCreate);

      const newSheets = createdSheets.map((s: any) => ({
        playerId: s.player_id as string,
        sheetId: s.id,
        current_ai_question: s.current_ai_question
      }));

      const mySheet = createdSheets.find((s: any) => s.player_id === playerId);
      if (mySheet) {
        setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
      }
      setAppState(prev => ({ ...prev, allStorySheets: newSheets }));

      const ts = new Date().toISOString();

      const targetGameLength = gameLength; // Always use the host's current local state since we just saved it

      let firstRoundId = "";
      if (storyMode) {

        const targetIndices = GAME_LENGTH_INDICES[targetGameLength] || GAME_LENGTH_INDICES[12];
        for (let i = 0; i < targetGameLength; i++) {
          const created = await safeApiCall(createRound, {
            session_id: sessionId,
            round_number: i + 1,
            question_type: (gameTemplate.id === 'custom_ai' ? TEMPLATES.classic.questionTypes : gameTemplate.questionTypes)[targetIndices[i] ?? i] as QuestionType,
            rounds_status: 'active',
            started_at: ts,
          });
          if (!created) return;
          if (i === 0) firstRoundId = created.id;
        }
      } else {
        const firstRound = await safeApiCall(createRound, {
          session_id: sessionId,
          round_number: 1,
          question_type: (gameTemplate.id === 'custom_ai' ? TEMPLATES.classic.questionTypes : gameTemplate.questionTypes)[GAME_LENGTH_INDICES[targetGameLength]?.[0] ?? 0] as QuestionType,
          rounds_status: 'active',
          started_at: ts,
        });
        if (!firstRound) return;
        firstRoundId = firstRound.id;
      }

      await updatePlayersBySession(sessionId, { players_status: 'playing' });

      await updateGameSession(sessionId, {
        session_status: 'active',
        max_players: players.length
      });

      setAppState(prev => ({
        ...prev,
        didGameStart: true,
        isLobby: false,
        isCreatingLobby: false,
        phase: Phases.Main,
        currentRound: 1,
        currentRoundId: firstRoundId,
        answeredRoundId: null,
        roundStartedAt: ts,
        userAnswers: [],
        totalCount: players.length,
        playerCount: players.length,
      }));
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_START' as any)) + err.message }));
    }
  };

  const doShowHistory = () => {
    setAppState(prev => ({ ...prev, phase: Phases.History }));
  };

  const doAnswerSubmit = async (answer: string) => {
    if (currentAnswers.some(a => {
      const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
      const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
      return String(aPlayerId) === String(playerId) && String(aRoundId) === String(currentRoundId);
    })) {
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      return;
    }

    const isMissing = answer.trim() === "" || answer.trim() === "Час вийшов";
    const fbArr1184 = (language === 'en' && activeTemplate.fallbacksEn) ? activeTemplate.fallbacksEn : activeTemplate.fallbacks;
    const fallbackPool = fbArr1184[currentRound - 1] ?? [""];
    const cleanAnswer = isMissing
      ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
      : answer;
    const updatedAnswers = [...userAnswers, cleanAnswer];
    setAppState(prev => ({ ...prev, userAnswers: updatedAnswers }));
    if (!currentRoundId || !playerId || !sessionId) {
      setIsTransitioning(false);

      if (currentRound < gameLength) {
        setAppState(prev => ({ ...prev, phase: Phases.Main, currentRound: prev.currentRound + 1 }));
      } else {
        const indices = GAME_LENGTH_INDICES[gameLength] || GAME_LENGTH_INDICES[12];
        const fullAnswers = Array(12).fill("");
        indices.forEach((qIndex, i) => { fullAnswers[qIndex] = updatedAnswers[i]; });
        for (let i = 0; i < 12; i++) {
          if (!fullAnswers[i]) {
            if (indices.includes(i)) {
              const fbArr1201 = (language === 'en' && activeTemplate.fallbacksEn) ? activeTemplate.fallbacksEn : activeTemplate.fallbacks;
              const pool = fbArr1201[i] || ["..."];
              fullAnswers[i] = pool[Math.floor(Math.random() * pool.length)];
            } else {
              fullAnswers[i] = "__REMOVE_ME__";
            }
          }
        }

        let localStory = activeTemplate.buildStory(fullAnswers, language, String(sessionId || 'local'), String(sessionId || 'local'));
        if (localStory.includes("__REMOVE_ME__")) {
          localStory = localStory.replace(/[^.!?]*__REMOVE_ME__[^.!?]*([.!?]\s*|$)/g, '').replace(/\s+/g, ' ').trim();
        }

        const isAIMode = activeTemplate.id === 'custom_ai';
        const seedStr = String(sessionId || "local") + String(nickname);
        let storySeed = 0;
        for (let k = 0; k < seedStr.length; k++) {
          storySeed = ((storySeed << 5) - storySeed) + seedStr.charCodeAt(k);
          storySeed |= 0;
        }
        storySeed = Math.abs(storySeed);

        if (isAIMode && isGroqAvailable()) {
          try {
            localStory = await generateAIStory(
              fullAnswers.filter(a => a && a.trim() && !a.includes('__REMOVE_ME__')),
              customTopic || t('GENERAL'),
              language as 'uk' | 'en',
              storySeed
            );
          } catch (aiErr) {
            console.warn('[Chepuha] SinglePlayer AI story generation failed, using template fallback:', aiErr);
          }
        } else if (isGroqAvailable()) {
           try {
              localStory = await refineStoryWithAI(localStory, language as 'uk' | 'en', storySeed);
           } catch (aiErr) {
              console.warn('[Chepuha] SinglePlayer AI refinement failed:', aiErr);
           }
        }

        setAppState(prev => ({
          ...prev,
          allStories: [{
            playerName: nickname,
            story: localStory,
            answers: updatedAnswers,
            templateId: activeTemplate.id
          }],
          phase: Phases.End
        }));
      }
      return;
    }
    try {
      let safeSheets = allStorySheets;
      if (safeSheets.length === 0) {
        const fetched = await getStorySheetsBySession(sessionId);
        safeSheets = fetched.map((s: any) => ({ playerId: s.player_id?.id || s.player_id, sheetId: s.id, current_ai_question: s.current_ai_question }));
        if (safeSheets.length > 0) setAppState(prev => ({ ...prev, allStorySheets: safeSheets }));
      }
      let targetSheet = myStorySheetId || safeSheets.find(s => s.playerId === playerId)?.sheetId;
      if ((safeSheets || []).length > 0 && (players || []).length > 0) {
        const sortedPlayers = [...(players || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        const myIndex = sortedPlayers.findIndex(p => p.id === playerId);
        let targetIndex = (myIndex - (currentRound - 1)) % sortedPlayers.length;
        if (targetIndex < 0) targetIndex += sortedPlayers.length;
        const targetPlayerId = sortedPlayers[targetIndex]?.id;
        targetSheet = safeSheets.find(s => s.playerId === targetPlayerId)?.sheetId || targetSheet;
      }
      await submitAnswer({
        answer_text: cleanAnswer,
        position_in_sheet: currentRound,
        player_id: playerId,
        round_id: currentRoundId,
        story_sheet_id: targetSheet,
      });

      if (activeTemplate.id === 'custom_ai' && targetSheet && currentRound < gameLength && isGroqAvailable()) {
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
            await updateStorySheetQuestion(targetSheet, nextQ);
          } catch(e) {
            console.error("AI question error:", e);
          }
        })();
      }

      const isStory = parsedStoryMode;
      const isLastRound = currentRound === gameLength;
      const isSolo = players.length <= 1;

      await updatePlayer(playerId, { players_status: isLastRound ? 'finished' : 'playing' });
      refreshState();
      const curAnswers = await getAnswersByRound(currentRoundId);
      setAppState(prev => ({ ...prev, joinedCount: curAnswers.length }));
      setAppState(prev => ({ ...prev, totalCount: playerCount > 0 ? playerCount : players.length }));
      setIsTransitioning(false);


      let nextPhase = Phases.Waiting;
      if (isStory) {
        if (isLastRound) {
          if (isSolo) {
            fetchFinalStoryResult();
            nextPhase = Phases.End;
          } else {
            nextPhase = Phases.Waiting;
          }
        } else {
          nextPhase = Phases.Main;
        }
      }

      setAppState(prev => ({
        ...prev,
        phase: nextPhase,
        currentRound: isStory && !isLastRound ? prev.currentRound + 1 : prev.currentRound,
        currentRoundId: isStory && !isLastRound ? (rounds.find(r => r.round_number === prev.currentRound + 1)?.id || null) : prev.currentRoundId,
        answeredRoundId: currentRoundId,
        error: ""
      }));
    } catch (err: any) {
      setIsTransitioning(false);
      setAppState(prev => ({
        ...prev,
        error: String(t('ERR_SUBMIT' as any)) + ": " + (err.message || String(err))
      }));
    }
  };

  const amIReady = currentAnswers.some(a => {
    const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
    const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
    return String(aPlayerId) === String(playerId) && String(aRoundId) === String(currentRoundId);
  });

  return (
    <div className={classNames("app-view", phase === Phases.History && "is-history")} lang={language}>
      {roomCode && !didGameStart && isLobby && phase !== Phases.Join && phase !== Phases.History && phase !== Phases.End && (
        <div className="create-game-pc-code-wrapper">
          <GameCode code={roomCode} className="gameCodePos create-code-mobile" />
        </div>
      )}

      {!didGameStart && !isCreatingLobby && phase === Phases.Main && !isLobby && (
        <MainMenu
          language={language}
          logoImage={logoImage}
          logoImageEng={logoImageEng}
          logoPop={logoPop}
          triggerLogoPop={triggerLogoPop}
          t={t}
          phase={phase}
          doShowCreateScreen={doShowCreateScreen}
          doShowJoinScreen={doShowJoinScreen}
          doShowHistory={doShowHistory}
          setLanguage={setLanguage}
          flagUk={flagUk}
          flagEn={flagEn}
        />
      )}

      {!didGameStart && isCreatingLobby && !isLobby && phase !== Phases.Join && (
        <CreateGameScreen
          roomCode={roomCode}
          nickname={nickname}
          error={error}
          carouselIndex={carouselIndex}
          carouselTemplates={CAROUSEL_TEMPLATES}
          gameLength={gameLength}
          colorHighlight={colorHighlight}
          hintsEnabled={hintsEnabled}
          storyMode={storyMode}
          phase={phase}
          t={t}
          carouselRef={carouselRef}
          onNicknameChange={handleNicknameChange}
          onEnter={goToLobby}
          onCarouselWheel={handleCarouselWheel}
          onCarouselTouchStart={handleCarouselTouchStart}
          onCarouselTouchEnd={handleCarouselTouchEnd}
          moveCarousel={moveCarousel}
          onGameLengthChange={(len) => setAppState(prev => ({ ...prev, gameLength: len }))}
          onColorHighlightToggle={() => setAppState(prev => ({ ...prev, colorHighlight: !prev.colorHighlight }))}
          onHintsEnabledToggle={() => setAppState(prev => ({ ...prev, hintsEnabled: !prev.hintsEnabled }))}
          onStoryModeToggle={() => setAppState(prev => ({ ...prev, storyMode: !prev.storyMode }))}
          onGoToLobby={goToLobby}
        />
      )}

      {!didGameStart && isLobby && phase !== Phases.Join && (
        <LobbyScreen
          lobbyTimeLeft={lobbyTimeLeft}
          nickname={nickname}
          playerColor={playerColor}
          parsedColorHighlight={parsedColorHighlight}
          players={players}
          playerId={playerId}
          availableColors={AVAILABLE_COLORS}
          crownImage={crownImage}
          pollError={pollError}
          isHost={isHost}
          phase={phase}
          t={t}
          playersListRef={playersListRef}
          cycleColor={cycleColor}
          onStartGame={doGameStart}
        />
      )}

      {phase === Phases.Join && (
        <JoinCard
          initialNick={nickname}
          initialRoom={roomCode}
          onJoin={handleJoinGame}
          onBack={goHome}
          errors={error ? { room: error } : undefined}
          loading={appState.isJoining}
        />
      )}

      {didGameStart && phase === Phases.Waiting && (
        <>
          <Round currentRound={currentRound} totalRounds={parsedGameLength} className="roundPos" />
          <WaitCard
            nick={nickname}
            playerColor={playerColor}
            joinedCount={derivedJoinedCount}
            totalCount={derivedTotalCount}
            currentRound={currentRound}
            totalRounds={parsedGameLength}
            message={t('WAITING_ANSWERS')}
          />
        </>
      )}

      {didGameStart && phase === Phases.Main && (
        <>
          <Timer
            key={`${currentRound}-${roundStartedAt}`}
            roundStartedAt={roundStartedAt}
            serverTimeOffset={serverTimeOffset}
            duration={parsedStoryMode ? (parsedGameLength === 6 ? 480 : parsedGameLength === 9 ? 720 : 900) : 120}
            onTimeUp={() => doAnswerSubmit("Час вийшов")}
            className="timerPos"
          />
          <Round currentRound={currentRound} totalRounds={parsedGameLength} className="roundPos" />
          <RoundCard
            playerName={nickname}
            playerColor={playerColor}
            phase={(amIReady && !parsedStoryMode) ? Phases.Waiting : phase}
            question={(() => {
              const baseTemplate = activeTemplate.id === 'chaos'
                ? TEMPLATES[
                ["classic", "new_year", "halloween", "summer", "student", "gaming", "romance", "adult", "anime", "cyber", "it", "movies", "math"][
                Math.abs(String((sessionId || "") + (playerId || nickname || "Guest")).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) + (currentRound || 0)) % 13
                ]
                ] || activeTemplate
                : activeTemplate;

              let roundQuestions = [...(baseTemplate.questions || [])];

              if (baseTemplate.id === 'math') {
                const seedStr = String(sessionId || roomCode || "guest") + String(playerId || "");
                const hash = seedStr.split("").reduce((a, c) => a + (c.charCodeAt(0) * 31), 0);
                for (let i = roundQuestions.length - 1; i > 0; i--) {
                  const j = Math.abs(hash + i * 53) % (i + 1);
                  [roundQuestions[i], roundQuestions[j]] = [roundQuestions[j], roundQuestions[i]];
                }
              }

              const rawQuestion = roundQuestions[currentRound - 1];

              if (baseTemplate.id === 'custom_ai') {
                // Find which sheet the player is holding
                let heldSheetId = null;
                if ((allStorySheets || []).length > 0 && (players || []).length > 0) {
                  const sortedPlayers = [...players].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                  const myIndex = sortedPlayers.findIndex(p => p.id === playerId);
                  let targetIndex = (myIndex - (currentRound - 1)) % sortedPlayers.length;
                  if (targetIndex < 0) targetIndex += sortedPlayers.length;
                  const targetPlayerId = sortedPlayers[targetIndex]?.id;
                  heldSheetId = allStorySheets.find(s => s.playerId === targetPlayerId)?.sheetId;
                }
                const heldSheetObj = heldSheetId ? allStorySheets.find(s => s.sheetId === heldSheetId) : null;
                // If it has a generated question, use it, else fallback to standard
                if (heldSheetObj && heldSheetObj.current_ai_question) {
                  return heldSheetObj.current_ai_question;
                }
                return '...';
              }

              if (rawQuestion?.startsWith('MATH_DYN_')) {
                const indexPart = parseInt(rawQuestion.split('_')[2] || "0", 10);
                const seedStr = String(sessionId || roomCode || "guest") + String(playerId || "");
                const hash = seedStr.split("").reduce((a, c) => a + (c.charCodeAt(0) * 17), 0);
                const offset = hash + indexPart * 73;
                return mathProblems[offset % mathProblems.length];
              }
              return rawQuestion;
            })()}
            playerTotal={derivedTotalCount}
            onSubmitAnswer={doAnswerSubmit}
            hints={parsedHintsEnabled ? ((language === 'en' && activeTemplate.fallbacksEn ? activeTemplate.fallbacksEn : activeTemplate.fallbacks)[currentRound - 1] || []) : undefined}
            showColors={parsedColorHighlight}
          />
        </>
      )}

      {phase === Phases.End && (
        <GameResult
          stories={allStories}
          storyIndex={storyIndex}
          onPrev={() => setAppState(prev => ({ ...prev, storyIndex: Math.max(0, prev.storyIndex - 1) }))}
          onNext={() => setAppState(prev => ({ ...prev, storyIndex: Math.min(prev.allStories.length - 1, prev.storyIndex + 1) }))}
          myNickname={nickname}
          phase={phase}
          onHome={goHome}
          onSave={() => { }}
          showColors={parsedColorHighlight}
        />
      )}

      {phase === Phases.History && !selectedHistoryGame && (
        <HistoryScreen
          games={savedGames}
          onSelectGame={(g) => {
            setAppState(prev => ({ ...prev, allStories: g.stories }));
            setAppState(prev => ({ ...prev, storyIndex: 0 }));
            setAppState(prev => ({ ...prev, selectedHistoryGame: g }));
          }}
          onHome={goHome}
        />
      )}

      {phase === Phases.History && selectedHistoryGame && (
        <GameResult
          stories={allStories}
          storyIndex={storyIndex}
          onPrev={() => setAppState(prev => ({ ...prev, storyIndex: Math.max(0, prev.storyIndex - 1) }))}
          onNext={() => setAppState(prev => ({ ...prev, storyIndex: Math.min((prev.allStories?.length || 1) - 1, prev.storyIndex + 1) }))}
          myNickname={nickname || "Гравець"}
          phase={phase}
          onHome={() => setAppState(prev => ({ ...prev, selectedHistoryGame: null }))}
          onSave={() => {}}
        />
      )}

      {((isLobby && phase !== Phases.History && phase !== Phases.Join) || phase === Phases.End) && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} style={{ zIndex: phase === Phases.End ? 10000 : undefined }} />
          <div className="red-guy-bg" onClick={playSecretMusic} style={{ zIndex: phase === Phases.End ? 10000 : undefined }} />
        </>
      )}


      { }
      {showCustomPrompt && (
        <CustomTopicModal
          customTopic={customTopic}
          isGeneratingQuestions={isGeneratingQuestions}
          error={error}
          t={t}
          onClose={() => setShowCustomPrompt(false)}
          onTopicChange={setCustomTopic}
          onSubmit={handleCustomTopicSubmit}
        />
      )}

      {(isCreatingLobby || isLobby || phase === Phases.Join) && phase !== Phases.End && phase !== Phases.History && (
        <HomeIcon onClick={goHome} className="homeIconPos" />
      )}
    </div>
  );
}

export default App;