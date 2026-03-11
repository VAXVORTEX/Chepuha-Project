import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  createGameSession,
  createPlayer,
  updateGameSession,
  updatePlayer,
  updatePlayersBySession,
  createRound,
  createStorySheet,
  createStorySheetsBatch,
  submitAnswer,
  getAnswersByRound,
  QuestionType,
  StorySheetStatus,
  getGameSessions,
  getStorySheetsBySession,
  getRoundsBySession,
  getPlayersBySession,
} from "./api";
import { TEMPLATES } from "./config/templates";
import { useLanguage } from "./contexts/LanguageContext";
import { Player } from "./api/types";

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
  allStorySheets: { playerId: string, sheetId: string }[];
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
    colorHighlight: false,
    playerColor: ''
  };

  try {
    const prefs = localStorage.getItem('chepuhaUserPrefs');
    if (prefs) {
      const p = JSON.parse(prefs);
      defaultState.nickname = p.nickname || '';
      defaultState.roomCode = p.roomCode || '';
    }

    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        // We only restore identifiers, not the game state (phase/didGameStart)
        // so that refresh always lands on the Home screen.
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
          colorHighlight: parsed.colorHighlight || false,
          playerColor: parsed.playerColor || '',
        };
      }
    }
  } catch (e) { }

  return defaultState;
};

export const AVAILABLE_COLORS = [
  '#e52929', '#2962e5', '#29a62b', '#e5a629', '#9c29e5',
  '#e529b3', '#29e5d0', '#ffffff', '#ff8c00', '#ff1493',
  '#00ff00', '#00bfff', '#8a2be2', '#a52a2a', '#ff69b4',
  '#4682b4', '#d2691e', '#32cd32'
];

function App() {
  const [appState, setAppState] = useState<AppState>(getInitialState);

  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;
    fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey
      }
    })
      .then(res => {
        const dateHeader = res.headers.get('date');
        if (dateHeader) {
          const sTime = Date.parse(dateHeader);
          if (!isNaN(sTime)) {
            setServerTimeOffset(Date.now() - sTime);
          }
        }
      })
      .catch(() => { });
  }, []);

  const { phase, didGameStart, currentRound, userAnswers, isCreatingLobby, isLobby, nickname, roomCode, selectedTemplate, error, allStories, storyIndex, selectedHistoryGame, joinedCount, totalCount, sessionId, playerId, isHost, currentRoundId, myStorySheetId, playerCount, roundStartedAt, allStorySheets, lobbyCreatedAt, answeredRoundId, gameLength, storyMode, hintsEnabled, colorHighlight, playerColor } = appState;
  const { session, players, rounds, currentAnswers, activeRoundId: hookActiveRoundId, error: pollError, refreshState, dataReady } = useGameState(sessionId);
  const hookMatch = hookActiveRoundId && currentRoundId && hookActiveRoundId === currentRoundId;
  const derivedTotalCount = totalCount > 0 ? totalCount : (players?.length || 0);
  const derivedJoinedCount = Math.min(
    hookMatch ? Math.max(joinedCount, currentAnswers.length) : joinedCount,
    derivedTotalCount > 0 ? derivedTotalCount : Infinity
  );
  const activeTemplate = TEMPLATES[session?.template || selectedTemplate] || TEMPLATES.classic;
  const { t, language, setLanguage } = useLanguage();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);
  const currentRoundIdRef = useRef(currentRoundId);
  const currentRoundRef = useRef(currentRound);
  const { savedGames, saveGameToHistory } = useHistory();

  // Carousel state — list starts with 'random', then all templates
  const CAROUSEL_TEMPLATES = ['random', ...Object.keys(TEMPLATES)];
  const [carouselIndex, setCarouselIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem('chepuhaCarouselIdx');
    if (savedIdx !== null) return parseInt(savedIdx, 10);
    return 0; // Default: show 'random' in center
  });
  const carouselRef = useRef<HTMLDivElement>(null);

  const moveCarousel = (dir: 1 | -1) => {
    setCarouselIndex(prev => {
      const next = (prev + dir + CAROUSEL_TEMPLATES.length) % CAROUSEL_TEMPLATES.length;
      const chosen = CAROUSEL_TEMPLATES[next];
      localStorage.setItem('chepuhaCarouselIdx', String(next));
      setAppState(ps => ({ ...ps, selectedTemplate: chosen === 'random' ? 'random' : chosen }));
      return next;
    });
  };

  const cycleColor = (direction: -1 | 1) => {
    setAppState(prev => {
      const idx = AVAILABLE_COLORS.indexOf(prev.playerColor);
      const currentIdx = idx === -1 ? 0 : idx;
      const newIdx = (currentIdx + direction + AVAILABLE_COLORS.length) % AVAILABLE_COLORS.length;
      return { ...prev, playerColor: AVAILABLE_COLORS[newIdx] };
    });
  };

  // Touch/swipe handling for carousel
  const touchStartY = useRef<number>(0);
  const handleCarouselTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleCarouselTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 30) moveCarousel(delta > 0 ? 1 : -1);
  };

  // Wheel scrolling for carousel
  const handleCarouselWheel = (e: React.WheelEvent) => {
    e.preventDefault();
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
    if (nickname || roomCode) {
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ nickname, roomCode }));
    }
  }, [nickname, roomCode]);

  useEffect(() => {
    const imagesToPreload = [
      logoImage, logoImageEng, crownImage, flagUk, flagEn,
      "/assets/images/yellowGuy.png",
      "/assets/images/RedGuyRemoved.png",
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
      const built = (sheets || [])
        .filter(s => s && s.answers && s.answers.length > 0)
        .map(s => {
          const sorted = [...(s.answers || [])].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
          const p = s.player_id as any;
          const nick = p?.nickname || 'Гравець';
          return {
            playerName: nick,
            story: activeTemplate.buildStory(sorted.map(a => a.answer_text), language, String(sessionId || 'local'), String(s.id || Math.random())),
            answers: sorted.map(a => a.answer_text),
            templateId: activeTemplate.id
          };
        });
      if (built.length > 0) {
        setAppState(prev => ({ ...prev, allStories: built }));
        // Mark session as completed in DB to avoid collisions and "tails"
        updateGameSession(sessionId, { session_status: 'completed' }).catch(() => { });
        const hostPlayer = players.find(p => p.player_order === 1) || players[0];
        const hostName = hostPlayer ? hostPlayer.nickname : 'Невідомо';
        const date = new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const gameRoomCode = session?.session_name || roomCode || 'Невідомо';
        saveGameToHistory({
          sessionId: sessionId,
          date,
          roomCode: gameRoomCode,
          hostName,
          stories: built
        });
      }
    } catch (err) { }
  }, [sessionId, players, session, roomCode, language, activeTemplate]);

  useEffect(() => {
    if (!didGameStart || !playerId || !sessionId) return;
    if (!dataReady) return;
    if (isTransitioning || transitionLockRef.current) return;

    const sorted = [...(rounds || [])].sort((a: any, b: any) => b.round_number - a.round_number);
    const latestRound = sorted[0];
    const myPlayer = players.find(p => p.id === playerId);

    if (!latestRound || !myPlayer) return;

    if (latestRound.round_number > currentRound || !currentRoundId) {
      let newPhase = Phases.Main;

      if (currentAnswers.some(a => {
        const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
        const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
        return String(aPlayerId) === String(playerId) && String(aRoundId) === String(latestRound.id);
      }) || (String(answeredRoundId) === String(latestRound.id))) {
        newPhase = Phases.Waiting;
      } else if (myPlayer.players_status === 'finished') {
        newPhase = Phases.End;
      }

      setAppState(prev => ({
        ...prev,
        currentRoundId: latestRound.id,
        currentRound: latestRound.round_number,
        roundStartedAt: latestRound.started_at || prev.roundStartedAt,
        phase: newPhase,
        joinedCount: 0,
        answeredRoundId: null // Crucial: clear and don't carry over
      }));
    } else if (String(latestRound.id) === String(currentRoundId)) {
      if (phase === Phases.Main && (currentAnswers.some(a => {
        const aPlayerId = typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : a.player_id;
        const aRoundId = typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : a.round_id;
        return String(aPlayerId) === String(playerId) && String(aRoundId) === String(currentRoundId);
      }) || String(answeredRoundId) === String(currentRoundId))) {
        setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      } else if (myPlayer.players_status === 'finished' && phase !== Phases.End && phase !== Phases.History) {
        fetchFinalStoryResult();
        setAppState(prev => ({ ...prev, phase: Phases.End }));
      }
    }
  }, [didGameStart, playerId, players, phase, sessionId, currentRound, currentRoundId, currentAnswers, rounds, isTransitioning, fetchFinalStoryResult, dataReady, answeredRoundId]);

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
          initialPhase = Phases.Waiting;
          initAnsweredId = latestRound.id;
        }
      }

      setAppState(prev => ({
        ...prev,
        didGameStart: true,
        isLobby: false,
        phase: initialPhase,
        currentRoundId: latestRound?.id || prev.currentRoundId,
        currentRound: latestRound?.round_number || prev.currentRound,
        roundStartedAt: latestRound?.started_at || prev.roundStartedAt,
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
          setAppState(prev => ({ ...prev, allStorySheets: sheets.map((s: any) => ({ playerId: s.player_id?.id || s.player_id, sheetId: s.id })) }));
        }

        const mySheet = (sheets || []).find((s: any) => (s.player_id?.id || s.player_id) === playerId);
        if (mySheet) setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
        if (players.length > 0) setAppState(prev => ({ ...prev, playerCount: players.length }));
      } catch (err) {
      }
    })();
  }, [session?.session_status, sessionId, playerId, players.length, refreshState]);

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

  const [lobbyTimeLeft, setLobbyTimeLeft] = useState(25 * 60);

  useEffect(() => {
    if (isLobby) {
      const dbStart = session?.session_created_at ? Date.parse(session.session_created_at) : null;
      const start = dbStart || lobbyCreatedAt || Date.now();

      if (!lobbyCreatedAt && !dbStart) {
        setAppState(prev => ({ ...prev, lobbyCreatedAt: start }));
      }

      const tick = setInterval(() => {
        const now = Date.now() - serverTimeOffset;
        const elapsed = Math.floor((now - start) / 1000);
        const remaining = Math.max(0, 25 * 60 - elapsed);
        setLobbyTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(tick);
          goHome();
        }
      }, 1000);
      return () => clearInterval(tick);
    } else {
      setLobbyTimeLeft(25 * 60);
    }
  }, [isLobby, lobbyCreatedAt, session?.session_created_at, serverTimeOffset]);

  useEffect(() => {
    if (!session || !currentRoundId || !sessionId || !didGameStart) return;
    if (phase !== Phases.Waiting && phase !== Phases.Main) return;
    const interval = setInterval(async () => {
      if (isTransitioning || transitionLockRef.current) return;
      try {
        const liveRoundId = currentRoundIdRef.current;
        if (!liveRoundId) return;
        const [curAnswers, freshPlayers] = await Promise.all([
          getAnswersByRound(liveRoundId),
          getPlayersBySession(sessionId)
        ]);

        if (liveRoundId !== currentRoundIdRef.current || isTransitioning || transitionLockRef.current) return;

        const total = freshPlayers.length;
        setAppState(prev => ({ ...prev, joinedCount: curAnswers.length, totalCount: total }));

        if (phaseRef.current !== Phases.Waiting) return;

        const now = Date.now();
        const startedAt = roundStartedAt ? Date.parse(roundStartedAt) : now;
        const timePassed = (now - startedAt) / 1000;

        if (curAnswers.length >= total || (isHost && timePassed > 130)) {
          if (!isHost) return;
          setIsTransitioning(true);
          transitionLockRef.current = true;

          if (isHost && curAnswers.length < total) {
            const playerIdsWhoAnswered = new Set(curAnswers.map(a =>
              typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : String(a.player_id)
            ));
            const missingPlayers = players.filter(p => !playerIdsWhoAnswered.has(p.id));
            const sheets = await getStorySheetsBySession(sessionId);

            for (const p of missingPlayers) {
              const pSheet = sheets.find(s => {
                const sid = typeof s.player_id === 'object' && s.player_id !== null ? (s.player_id as any).id : String(s.player_id);
                return sid === p.id;
              });
              if (pSheet) {
                const fallbackPool = activeTemplate.fallbacks[currentRound - 1] ?? ["..."];
                await submitAnswer({
                  answer_text: fallbackPool[Math.floor(Math.random() * fallbackPool.length)],
                  position_in_sheet: currentRound,
                  player_id: p.id,
                  round_id: currentRoundId,
                  story_sheet_id: pSheet.id,
                });
              }
            }
          }

          if (currentRound < gameLength) {
            if (isHost) {
              const ts = new Date().toISOString();
              const nextRoundNum = currentRound + 1;
              const nextRound = await createRound({
                session_id: sessionId,
                round_number: nextRoundNum,
                question_type: activeTemplate.questionTypes[nextRoundNum - 1],
                rounds_status: 'active',
                started_at: ts,
              });
              updatePlayersBySession(sessionId, { players_status: 'playing' }).catch(() => { });
              currentRoundIdRef.current = nextRound.id;
              currentRoundRef.current = nextRoundNum;
              setAppState(prev => ({
                ...prev,
                currentRoundId: nextRound.id,
                currentRound: nextRoundNum,
                roundStartedAt: ts,
                joinedCount: 0,
                phase: Phases.Main
              }));
              setTimeout(() => {
                setIsTransitioning(false);
                transitionLockRef.current = false;
              }, 500);
            }
          } else {
            if (isHost) {
              await updatePlayersBySession(sessionId, { players_status: 'finished' });
              await updateGameSession(sessionId, { session_status: 'completed' });
            }
            fetchFinalStoryResult();
            setTimeout(() => {
              setIsTransitioning(false);
              transitionLockRef.current = false;
              setAppState(prev => ({ ...prev, phase: Phases.End }));
            }, 1000);
          }
        }
      } catch (err) {
        setIsTransitioning(false);
        transitionLockRef.current = false;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [phase, session?.id, currentRoundId, playerCount, players.length, currentRound, isHost, sessionId, fetchFinalStoryResult, roundStartedAt, activeTemplate, didGameStart, isTransitioning]);

  const generateRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const goHome = () => {
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
    }));
    localStorage.removeItem(STATE_STORAGE_KEY);
  };

  const doShowCreateScreen = () => {
    localStorage.removeItem(STATE_STORAGE_KEY);
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
      error: ""
    }));
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 25) {
      setAppState(prev => ({ ...prev, nickname: value, error: "" }));
    } else {
      setAppState(prev => ({ ...prev, error: String(t('ERR_NICK_LONG' as any)) }));
    }
  };

  const goToLobby = async () => {
    if (!nickname.trim()) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_NICKNAME' as any)) }));
      return;
    }
    try {
      const newSession = await createGameSession({
        session_name: roomCode,
        max_players: 12,
        session_status: 'waiting',
        template: selectedTemplate,
      });
      setAppState(prev => ({ ...prev, sessionId: newSession.id }));

      const hostPlayer = await createPlayer({
        nickname,
        session_id: newSession.id,
        players_status: 'joined',
        player_order: 1,
      });
      setAppState(prev => ({ ...prev, playerId: hostPlayer.id }));
      setAppState(prev => ({ ...prev, isHost: true }));
      setAppState(prev => ({ ...prev, isLobby: true }));
      setAppState(prev => ({ ...prev, lobbyCreatedAt: Date.now() }));
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ nickname, roomCode }));
      await refreshState();
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_CREATE' as any)) + err.message }));
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
      error: ""
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

      // Set nickname, roomCode early for UX but DON'T set sessionId yet to avoid triggering
      // useGameState refetch before we have the full rejoin state ready
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

        // Set all state atomically in a single call — including sessionId — to prevent
        // the sync useEffect from running mid-update with stale state
        // Enforce a minimum duration for the "Joining" message (3 seconds)
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
          }));
          refreshState();
        };
        finishJoin();
      } else {
        const guest = await createPlayer({
          nickname: nick,
          session_id: targetSession.id,
          players_status: 'joined',
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
    try {
      const sheetsToCreate = players.map(p => ({
        game_session_id: sessionId,
        player_id: p.id,
        storysheets_status: 'in_progress' as StorySheetStatus,
      }));

      const createdSheets = await createStorySheetsBatch(sheetsToCreate);

      const newSheets = createdSheets.map((s: any) => ({
        playerId: s.player_id as string,
        sheetId: s.id
      }));

      const mySheet = createdSheets.find((s: any) => s.player_id === playerId);
      if (mySheet) {
        setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
      }
      setAppState(prev => ({ ...prev, allStorySheets: newSheets }));

      const ts = new Date().toISOString();
      const firstRound = await createRound({
        session_id: sessionId,
        round_number: 1,
        question_type: activeTemplate.questionTypes[0],
        rounds_status: 'active',
        started_at: ts,
      });

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
        currentRoundId: firstRound.id,
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
    const fallbackPool = activeTemplate.fallbacks[currentRound - 1] ?? [""];
    const cleanAnswer = isMissing
      ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
      : answer;
    const updatedAnswers = [...userAnswers, cleanAnswer];
    setAppState(prev => ({ ...prev, userAnswers: updatedAnswers }));
    if (!currentRoundId || !playerId || !sessionId) {
      setIsTransitioning(false);
      // Solo mode
      if (currentRound < gameLength) {
        setAppState(prev => ({ ...prev, phase: Phases.Main, currentRound: prev.currentRound + 1 }));
      } else {
        setAppState(prev => ({
          ...prev,
          allStories: [{
            playerName: nickname,
            story: activeTemplate.buildStory(updatedAnswers, language, String(sessionId || 'local'), String(Math.random())),
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
        safeSheets = fetched.map((s: any) => ({ playerId: s.player_id?.id || s.player_id, sheetId: s.id }));
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
      await updatePlayer(playerId, { players_status: 'ready' });
      refreshState();
      const curAnswers = await getAnswersByRound(currentRoundId);
      setAppState(prev => ({ ...prev, joinedCount: curAnswers.length }));
      setAppState(prev => ({ ...prev, totalCount: playerCount > 0 ? playerCount : players.length }));
      setIsTransitioning(false);

      // Story Mode OR Single-player: advance immediately to next question without waiting
      if ((storyMode || totalCount <= 1) && currentRound < gameLength) {
        setAppState(prev => ({
          ...prev,
          phase: Phases.Main,
          currentRound: prev.currentRound + 1,
          answeredRoundId: currentRoundId,
          error: ""
        }));
      } else {
        setAppState(prev => ({
          ...prev,
          phase: Phases.Waiting,
          answeredRoundId: currentRoundId,
          error: ""
        }));
      }
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
    <div className="app-view">
      {roomCode && !didGameStart && (isCreatingLobby || isLobby) && phase !== Phases.Join && phase !== Phases.History && phase !== Phases.End && (
        <GameCode code={roomCode} className="gameCodePos" />
      )}

      {!didGameStart && !isCreatingLobby && phase === Phases.Main && !isLobby && (
        <>
          <div className="logo-wrapper">
            <img src={language === 'en' ? logoImageEng : logoImage} alt="Чепуха Лого" className="logo" />
            <div className="logo-boy-hitbox hitbox-1" onClick={playSecretMusic} />
            <div className="logo-boy-hitbox hitbox-2" onClick={playSecretMusic} />
            <div className="logo-boy-hitbox hitbox-3" onClick={playSecretMusic} />
          </div>
          <div className="menu-buttons">
            <Button
              label={t('CREATE_GAME')}
              variant="primary"
              phase={phase}
              onClick={doShowCreateScreen}
            />
            <Button
              label={t('JOIN_GAME')}
              variant="primary"
              phase={phase}
              onClick={doShowJoinScreen}
            />
            <Button
              label={t('HISTORY')}
              variant="primary"
              phase={phase}
              onClick={doShowHistory}
            />
          </div>
          <div className="language-selector">
            <button
              className={`lang-btn ${language === 'uk' ? 'active' : ''}`}
              onClick={() => setLanguage('uk')}
            >
              <img src={flagUk} alt="UK" />
            </button>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              <img src={flagEn} alt="EN" />
            </button>
          </div>
        </>
      )}

      {!didGameStart && isCreatingLobby && !isLobby && phase !== Phases.Join && (
        <>
          <div className="create-game-container" style={{ pointerEvents: 'none' }}>
            <div className="input-wrapper" style={{ pointerEvents: 'auto' }}>
              <input
                type="text"
                className={`nickname-input ${error ? "error" : ""}`}
                placeholder={t('ENTER_NICK_PLACEHOLDER')}
                value={nickname}
                onChange={handleNicknameChange}
              />
            </div>
            <span className="error-message" style={{ minHeight: '24px', display: 'block', pointerEvents: 'auto' }}>{error || '\u00A0'}</span>

            {/* ── Row: Carousel + Game Length + Options ── */}
            <div className="create-options-row" style={{ pointerEvents: 'auto' }}>

              {/* Carousel */}
              <div className="carousel-section">
                <h3 className="template-title" style={{ marginBottom: "15px" }}>{t('CHOOSE_STORY')}</h3>
                <div
                  className="template-carousel"
                  ref={carouselRef}
                  onWheel={handleCarouselWheel}
                  onTouchStart={handleCarouselTouchStart}
                  onTouchEnd={handleCarouselTouchEnd}
                >
                  <button className="carousel-arrow carousel-arrow-up" onClick={() => moveCarousel(-1)}>▲</button>
                  <div className="carousel-window">
                    {[-2, -1, 0, 1, 2].map(offset => {
                      const idx = (carouselIndex + offset + CAROUSEL_TEMPLATES.length) % CAROUSEL_TEMPLATES.length;
                      const id = CAROUSEL_TEMPLATES[idx];
                      const label = id === 'random' ? t('RANDOM' as any) : (t(id.toUpperCase() as any) || id);
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

              {/* Game Length + Extra Options */}
              <div className="game-settings-container">
                <div className="game-settings-section">

                  {/* Game Length */}
                  <div className="game-length-picker">
                    <h3 className="template-title">{t('GAME_LENGTH_TITLE' as any)}</h3>
                    {([6, 9, 12] as Array<6 | 9 | 12>).map(len => (
                      <label key={len} className={`length-option ${gameLength === len ? 'length-option--active' : ''}`}>
                        <input type="radio" name="gameLength" value={len} checked={gameLength === len}
                          onChange={() => setAppState(prev => ({ ...prev, gameLength: len }))} />
                        <span className="length-pill">
                          {len === 6 ? t('GAME_LENGTH_SHORT' as any) : len === 9 ? t('GAME_LENGTH_NORMAL' as any) : t('GAME_LENGTH_LONG' as any)}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Extra Options */}
                  <div className="extra-options">
                    {/* Color Highlight */}
                    <label className={`toggle-option ${colorHighlight ? 'toggle-option--active' : ''}`}>
                      <span className="toggle-label">🎨 {t('OPTS_HIGHLIGHTS' as any)}</span>
                      <div className="toggle-switch" onClick={() => setAppState(prev => ({ ...prev, colorHighlight: !prev.colorHighlight }))}>
                        <div className={`toggle-knob ${colorHighlight ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {/* Hints */}
                    <label className={`toggle-option ${hintsEnabled ? 'toggle-option--active' : ''}`}>
                      <span className="toggle-label">💡 {t('OPTS_HINTS' as any)}</span>
                      <div className="toggle-switch" onClick={() => setAppState(prev => ({ ...prev, hintsEnabled: !prev.hintsEnabled }))}>
                        <div className={`toggle-knob ${hintsEnabled ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {/* Story Mode */}
                    <label className={`toggle-option ${storyMode ? 'toggle-option--active' : ''}`}>
                      <span className="toggle-label">🕹 {t('STORY_MODE' as any)}</span>
                      <div className="toggle-switch" onClick={() => setAppState(prev => ({ ...prev, storyMode: !prev.storyMode }))}>
                        <div className={`toggle-knob ${storyMode ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>
                    {storyMode && <div className="story-mode-desc-container"><p className="story-mode-desc">{t('STORY_MODE_DESC' as any)}</p></div>}
                  </div>

                </div>
              </div>
            </div>

            <div style={{ pointerEvents: 'auto' }}>
              <Button
                label={t('CREATE_GAME')}
                variant="primary"
                phase={phase}
                onClick={goToLobby}
              />
            </div>
          </div>
        </>
      )}

      {!didGameStart && isLobby && phase !== Phases.Join && (
        <>
          <div className="lobby-timer-display">
            <span className="timer-title">{t('LOBBY_TIMER_TITLE' as any)}</span>
            <span className="timer-time">
              {Math.ceil(lobbyTimeLeft / 60)} {t('LOBBY_MIN_SUFFIX' as any)}
            </span>
          </div>
          <div className="lobby-container">
            <div className="lobby-info">
              <h2 className="lobby-text">{t('YOUR_NICK')} {nickname}</h2>
              <h3 className="lobby-subtitle">{t('PLAYER_LIST')}</h3>
              <div className="players-list">
                {players.length > 0 ? (
                  players.map((p, i) => {
                    const isMe = String(p.id) === String(playerId) || (i === 0 && nickname === p.nickname);
                    return (
                      <div key={p.id || String(i)} className="player-item">
                        <div className="player-name-wrapper">
                          {i === 0 && <img src={crownImage} alt="Host" className="crown-icon" />}
                          <span className="player-name">{p.nickname}</span>
                        </div>
                        {isMe && (
                          <div className="inline-color-picker">
                            <span className="inline-color-label">{t('COLOR' as any).toLowerCase()}</span>
                            <button className="inline-color-arrow" onClick={() => cycleColor(-1)}>◀</button>
                            <div className="inline-color-swatch" style={{ background: playerColor }} />
                            <button className="inline-color-arrow" onClick={() => cycleColor(1)}>▶</button>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="player-item">
                    <div className="player-name-wrapper">
                      <img src={crownImage} alt="Host" className="crown-icon" />
                      <span className="player-name">{nickname}</span>
                    </div>
                    <div className="inline-color-picker">
                      <span className="inline-color-label">{t('COLOR' as any).toLowerCase()}</span>
                      <button className="inline-color-arrow" onClick={() => cycleColor(-1)}>◀</button>
                      <div className="inline-color-swatch" style={{ background: playerColor }} />
                      <button className="inline-color-arrow" onClick={() => cycleColor(1)}>▶</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="error-message" style={{ color: "red", minHeight: '24px' }}>
              {pollError ? (t(pollError as any) || pollError) : '\u00A0'}
            </div>
            <div className="lobby-actions">
              {isHost ? (
                <Button label={t('START_GAME')} variant="primary" phase={phase} onClick={doGameStart} disabled={players.length < 1} />
              ) : (
                <h3 className="waiting-host-text">{t('WAITING_HOST')}</h3>
              )}
            </div>
          </div>
        </>
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
          <Round
            className="roundPos"
            currentRound={currentRound}
            totalRounds={activeTemplate.questions.length}
          />
          <WaitCard
            nick={nickname}
            joinedCount={derivedJoinedCount}
            totalCount={derivedTotalCount}
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
            onTimeUp={() => doAnswerSubmit("Час вийшов")}
            className="timerPos"
          />
          <Round currentRound={currentRound} totalRounds={gameLength} className="roundPos" />
          <RoundCard
            playerName={nickname}
            phase={amIReady ? Phases.Waiting : phase}
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

              if (rawQuestion?.startsWith('MATH_DYN_')) {
                const indexPart = parseInt(rawQuestion.split('_')[2] || "0", 10);
                const seedStr = String(sessionId || roomCode || "guest") + String(playerId || "");
                const hash = seedStr.split("").reduce((a, c) => a + (c.charCodeAt(0) * 17), 0);
                const offset = hash + indexPart * 73;
                return mathProblems[offset % mathProblems.length];
              }
              return rawQuestion;
            })()}
            playerReady={derivedJoinedCount}
            playerTotal={derivedTotalCount}
            onSubmitAnswer={doAnswerSubmit}
            hints={hintsEnabled ? (activeTemplate.fallbacks[currentRound - 1] || []) : undefined}
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
          onNext={() => setAppState(prev => ({ ...prev, storyIndex: Math.min(prev.allStories.length - 1, prev.storyIndex + 1) }))}
          myNickname={nickname || "Гравець"}
          phase={phase}
          onHome={() => setAppState(prev => ({ ...prev, selectedHistoryGame: null }))}
        />
      )}

      {/* Global Background Characters & Home Button Sync */}
      {/* Global Background Characters & Home Button Sync */}
      {/* Boys: Lobby, Create, Join, and Waiting for Answers during game */}
      {(isCreatingLobby || isLobby || phase === Phases.Join || (didGameStart && phase === Phases.Waiting)) && phase !== Phases.End && phase !== Phases.History && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
        </>
      )}

      {/* Home Button: Lobby, Create, Join ONLY */}
      {(isCreatingLobby || isLobby || phase === Phases.Join) && phase !== Phases.End && phase !== Phases.History && (
        <HomeIcon onClick={goHome} className="homeIconPos" />
      )}
    </div>
  );
}

export default App;
