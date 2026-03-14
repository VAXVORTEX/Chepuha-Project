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
    colorHighlight: true,
    playerColor: AVAILABLE_COLORS[0]
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
          colorHighlight: true,
          playerColor: parsed.playerColor || AVAILABLE_COLORS[0],
        };
      }
    }
  } catch (e) { }

  return defaultState;
};

export const AVAILABLE_COLORS = [
  // REDS
  '#e52929', '#ff0000', '#8b0000', '#ff4500', '#ff6347',
  // ORANGES
  '#ff8c00', '#ffa500', '#e5a629', '#ffd700',
  // YELLOWS
  '#ffff00', '#fafad2', '#ffffed',
  // GREENS
  '#29a62b', '#00ff00', '#32cd32', '#008000', '#adff2f', '#98fb98', '#00fa9a',
  // BLUES
  '#2962e5', '#00bfff', '#0000ff', '#00008b', '#4682b4', '#87ceeb', '#add8e6',
  // PURPLES
  '#9c29e5', '#8a2be2', '#4b0082', '#9932cc', '#ba55d3', '#e6e6fa',
  // PINKS
  '#e529b3', '#ff69b4', '#ff1493', '#ffc0cb', '#db7093',
  // CYANS/TEALS
  '#29e5d0', '#00ffff', '#20b2aa', '#40e0d0',
  // GRAYS / BLACK
  '#ffffff', '#808080', '#c0c0c0', '#dcdcdc', '#000000',
  // SPECIALS
  'special:rainbow', 'special:fire-gradient', 'special:ice-gradient', 'special:flag-ua', 'special:flag-usa', 'special:flag-uk'
];

const GAME_LENGTH_INDICES: Record<number, number[]> = {
  6: [0, 1, 2, 4, 6, 11],
  9: [0, 1, 2, 3, 4, 6, 7, 9, 11],
  12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

const getNicknameStyle = (color: string) => {
  if (color?.startsWith('special:')) {
    return {}; // Handled by class name
  }
  const isBlack = !color || color === '#000000' || color === '#000';
  return {
    color: color || '#000000',
    textShadow: isBlack ? 'none' : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
  };
};

const getNicknameClassName = (color: string) => {
  if (color?.startsWith('special:')) {
    return `player-name ${color.replace('special:', '')}-text`;
  }
  return 'player-name';
};

const PlayerItem = ({ p, i, isMe, playerColor, cycleColor, AVAILABLE_COLORS, crownImage, showColorPicker }: any) => {
  const [pulse, setPulse] = useState(false);
  const defaultColor = AVAILABLE_COLORS[i % AVAILABLE_COLORS.length];
  const activeColor = isMe && playerColor ? playerColor : (p.color || defaultColor);
  const prevColor = useRef(activeColor);

  useEffect(() => {
    if (prevColor.current !== activeColor) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      prevColor.current = activeColor;
      return () => clearTimeout(timer);
    }
  }, [activeColor]);

  return (
    <div key={p.id || String(i)} className={`player-item ${pulse ? 'color-updated' : ''}`}>
      <div className="player-name-wrapper">
        {i === 0 && <img src={crownImage} alt="Host" className="crown-icon" />}
        <span
          className={`${getNicknameClassName(activeColor)} ${!showColorPicker ? 'no-highlight' : ''}`}
          style={showColorPicker ? getNicknameStyle(activeColor) : { color: '#000000', textShadow: 'none' }}
        >
          {p.nickname}
        </span>
      </div>
      {isMe && showColorPicker && (
        <div className="inline-color-picker">
          <button className="inline-color-arrow" onClick={() => cycleColor(-1)}>◀</button>
          <div className={`inline-color-swatch ${activeColor?.startsWith('special:') ? activeColor.replace('special:', '') : ''}`} style={!activeColor?.startsWith('special:') ? { background: activeColor } : {}} />
          <button className="inline-color-arrow" onClick={() => cycleColor(1)}>▶</button>
        </div>
      )}
    </div>
  );
};

// Helper to safely call API functions that might fail due to missing columns (like 'color')
const safeApiCall = async (apiFunc: any, payload: any) => {
  try {
    return await apiFunc(payload);
  } catch (err: any) {
    // If it's a "column not found" error, try again without the 'color' property
    if (err && (String(err.message).includes('column') || String(err.message).includes('schema cache'))) {
      const { color, ...fallbackPayload } = payload;
      console.warn("Retrying API call without 'color' column due to DB error:", err.message);
      return await apiFunc(fallbackPayload);
    }
    throw err;
  }
};

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
      hookMatch ? Math.max(joinedCount, currentAnswers.length) : joinedCount,
      derivedTotalCount > 0 ? derivedTotalCount : Infinity
    );

  const { t, language, setLanguage } = useLanguage();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);
  const currentRoundIdRef = useRef(currentRoundId);
  const currentRoundRef = useRef(currentRound);

  const activeTemplate = TEMPLATES[actualTemplateKey] || TEMPLATES.classic;
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
      const idx = AVAILABLE_COLORS.indexOf(prev.playerColor || '#000000');
      const currentIdx = idx === -1 ? 0 : idx;
      let nextIdx = (currentIdx + direction + AVAILABLE_COLORS.length) % AVAILABLE_COLORS.length;

      // Locking: prevent picking a color that another player already has
      const takenColors = (players || []).map(p => p.color).filter(c => c && c !== prev.playerColor);
      let attempts = 0;
      while (takenColors.includes(AVAILABLE_COLORS[nextIdx]) && attempts < AVAILABLE_COLORS.length) {
        nextIdx = (nextIdx + direction + AVAILABLE_COLORS.length) % AVAILABLE_COLORS.length;
        attempts++;
      }

      const newColor = AVAILABLE_COLORS[nextIdx];
      if (playerId) {
        // Use a background call to update the player in DB
        updatePlayer(playerId, { color: newColor }).catch((err) => {
          if (String(err.message).includes('column') || String(err.message).includes('schema cache')) {
            console.warn("DB 'color' column missing, skipping sync.");
          }
        });
      }
      return { ...prev, playerColor: newColor };
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

  // Sync settings to DB (Host only)
  useEffect(() => {
    if (isHost && sessionId && isLobby) {
      const packedTemplate = `${selectedTemplate}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;
      updateGameSession(sessionId, { template: packedTemplate }).catch(() => { });
    }
  }, [isHost, sessionId, isLobby, selectedTemplate, gameLength, storyMode, hintsEnabled, colorHighlight]);

  // Sync player color to DB
  useEffect(() => {
    if (sessionId && playerId && playerColor) {
      updatePlayer(playerId, { color: playerColor }).catch((err) => {
        if (String(err.message).includes('column') || String(err.message).includes('schema cache')) {
          // Robustness: if column is missing, stop trying to sync to DB but keep local color
        }
      });
    }
  }, [sessionId, playerId, playerColor]);

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
        // We now include sheets even if they have no answers yet (they will be filled by fallbacks)
        .map(s => {
          const sorted = [...(s.answers || [])].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
          const p = s.player_id as any;
          // Fallback to name from the player list if not in the sheet object
          const sheetOwnerId = typeof s.player_id === 'object' ? s.player_id.id : s.player_id;
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
              const pool = activeTemplate.fallbacks[i] || ["..."];
              fullAnswers[i] = pool[Math.floor(Math.random() * pool.length)];
            }
          }

          const coloredAnswers = fullAnswers.map((ans, idx) => {
            if (!parsedColorHighlight) return ans;
            const originalAnswer = (s.answers || []).find((a: any) => a.position_in_sheet === (idx + 1));
            const ansOwnerId = originalAnswer ? (typeof originalAnswer.player_id === 'object' ? originalAnswer.player_id.id : originalAnswer.player_id) : null;
            const owner = players.find(p => String(p.id) === String(ansOwnerId));
            const color = owner?.color || (String(ansOwnerId) === String(playerId) ? playerColor : '#fff');

            if (color === 'special:flag-ua') {
              return ans.split(' ').map((word: string, i: number, arr: string[]) => {
                const c = i < arr.length / 2 ? '#0057b7' : '#ffd700';
                return `<span style="color: ${c}; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${word}</span>`;
              }).join(' ');
            }
            if (color === 'special:flag-usa') {
              return ans.split(' ').map((word: string, i: number, arr: string[]) => {
                const c = i % 3 === 0 ? '#bf0a30' : i % 3 === 1 ? '#ffffff' : '#00247d';
                return `<span style="color: ${c}; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${word}</span>`;
              }).join(' ');
            }
            if (color === 'special:flag-uk') {
              return ans.split(' ').map((word: string, i: number, arr: string[]) => {
                const c = i % 2 === 0 ? '#cf142b' : '#00247d';
                return `<span style="color: ${c}; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${word}</span>`;
              }).join(' ');
            }
            if (color === 'special:rainbow') {
              const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
              return ans.split(' ').map((word: string, i: number, arr: string[]) => {
                const c = rainbowColors[i % rainbowColors.length];
                return `<span style="color: ${c}; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${word}</span>`;
              }).join(' ');
            }

            const isSpecial = color?.startsWith('special:');
            let style = `color: ${color}; font-weight: bold;`;
            let className = '';

            if (isSpecial) {
              className = ` class="${color.replace('special:', '')}-text"`;
              style = ''; // Handled by class
            } else {
              const shadow = (color === '#000000' || color === '#000') ? 'none' : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.5)';
              style += ` text-shadow: ${shadow};`;
            }
            return `<span${className} style="${style}">${ans}</span>`;
          });

          return {
            playerName: nick,
            story: activeTemplate.buildStory(coloredAnswers, language, String(sessionId || 'local'), String(s.id || Math.random())),
            answers: fullAnswers,
            templateId: activeTemplate.id
          };
        });

      if (built.length > 0) {
        // Validation: skip if NO SHEETS were found at all (shouldn't happen if game started)
        const hasAnySheets = built.length > 0;
        if (!hasAnySheets) return;

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
  }, [sessionId, players, session, roomCode, language, activeTemplate, parsedColorHighlight, playerId, playerColor, gameLength]);

  useEffect(() => {
    if (!didGameStart || !playerId || !sessionId) return;
    if (!dataReady) return;
    if (isTransitioning || transitionLockRef.current) return;

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
        answeredRoundId: null
      }));
    } else if (String(latestRound.id) === String(currentRoundId) || isStory) {
      if (session?.session_status === 'completed' && phase !== Phases.End && phase !== Phases.History) {
        fetchFinalStoryResult();
        setAppState(prev => ({ ...prev, phase: Phases.End }));
      } else if (phase === Phases.Main && !isStory && (currentAnswers.some(a => {
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
          initialPhase = parsedStoryMode ? Phases.Main : Phases.Waiting;
          initAnsweredId = latestRound.id;
        }
      }

      // In Story Mode, we might want to start at the round we are actually on
      let targetRound = latestRound;
      let targetRoundNumber = latestRound?.round_number || 1;
      if (parsedStoryMode && (rounds || []).length > 0) {
        // Find the first round the player hasn't answered yet
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

        let maxTime = 130;
        if (storyMode) {
          if (gameLength === 6) maxTime = 480;      // 8 mins
          else if (gameLength === 9) maxTime = 720; // 12 mins
          else if (gameLength === 12) maxTime = 900; // 15 mins
        }

        const isStory = !!(session?.template?.split('|')[2] === '1' || storyMode);
        const allFinished = isStory && freshPlayers.every(p => p.players_status === 'finished');

        if ((curAnswers.length >= total && !isStory) || allFinished || (isHost && timePassed > maxTime)) {
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

          if (currentRound < gameLength && !isStory) {
            if (isHost) {
              const ts = new Date().toISOString();
              const nextRoundNum = currentRound + 1;
              const nextRound = await createRound({
                session_id: sessionId,
                round_number: nextRoundNum,
                question_type: activeTemplate.questionTypes[GAME_LENGTH_INDICES[gameLength]?.[nextRoundNum - 1] ?? (nextRoundNum - 1)],
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
              // Ensure all players are marked as finished and session is completed
              await updatePlayersBySession(sessionId, { players_status: 'finished' });
              await updateGameSession(sessionId, { session_status: 'completed' });

              // Give Supabase a moment to propagate
              await new Promise(r => setTimeout(r, 500));
              await fetchFinalStoryResult();

              setAppState(prev => ({ ...prev, phase: Phases.End }));
              setIsTransitioning(false);
              transitionLockRef.current = false;
            }
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
      playerColor: "",
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
      error: "",
      playerColor: ""
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
      let templateToSave = selectedTemplate;
      if (templateToSave === 'random') {
        const tKeys = Object.keys(TEMPLATES);
        templateToSave = tKeys[Math.floor(Math.random() * tKeys.length)];
      }

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
        lobbyCreatedAt: Date.now()
      }));
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
            gameLength: targetSession.template ? (parseInt(targetSession.template.split('|')[1]) as 6 | 9 | 12) : 9,
            storyMode: targetSession.template ? targetSession.template.split('|')[2] === '1' : false,
            hintsEnabled: targetSession.template ? targetSession.template.split('|')[3] === '1' : true,
            colorHighlight: targetSession.template ? targetSession.template.split('|')[4] === '1' : true,
          }));
          refreshState();
        };
        finishJoin();
      } else {
        const takenColors = existingPlayers.map((p: Player) => p.color).filter(Boolean);
        const availableUnique = AVAILABLE_COLORS.filter(c => !takenColors.includes(c));
        const guestColor = availableUnique.length > 0
          ? availableUnique[0]
          : AVAILABLE_COLORS[existingPlayers.length % AVAILABLE_COLORS.length];

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
            storyMode: targetSession.template ? targetSession.template.split('|')[2] === '1' : false,
            hintsEnabled: targetSession.template ? targetSession.template.split('|')[3] === '1' : true,
            colorHighlight: targetSession.template ? targetSession.template.split('|')[4] === '1' : true,
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
      // Need to use the correctly parsed length rather than the pre-sync gameLength
      const targetGameLength = session?.template ? (parseInt(session.template.split('|')[1]) as 6 | 9 | 12) : gameLength;

      let firstRoundId = "";
      if (storyMode) {
        // Create all rounds upfront for story mode to allow async progress
        const targetIndices = GAME_LENGTH_INDICES[targetGameLength] || GAME_LENGTH_INDICES[12];
        for (let i = 0; i < targetGameLength; i++) {
          const created = await createRound({
            session_id: sessionId,
            round_number: i + 1,
            question_type: activeTemplate.questionTypes[targetIndices[i] ?? i],
            rounds_status: 'active',
            started_at: ts,
          });
          if (i === 0) firstRoundId = created.id;
        }
      } else {
        const firstRound = await createRound({
          session_id: sessionId,
          round_number: 1,
          question_type: activeTemplate.questionTypes[GAME_LENGTH_INDICES[targetGameLength]?.[0] ?? 0],
          rounds_status: 'active',
          started_at: ts,
        });
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
        const indices = GAME_LENGTH_INDICES[gameLength] || GAME_LENGTH_INDICES[12];
        const fullAnswers = Array(12).fill("");
        indices.forEach((qIndex, i) => { fullAnswers[qIndex] = updatedAnswers[i]; });
        for (let i = 0; i < 12; i++) {
          if (!fullAnswers[i]) {
            const pool = activeTemplate.fallbacks[i] || ["..."];
            fullAnswers[i] = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        setAppState(prev => ({
          ...prev,
          allStories: [{
            playerName: nickname,
            story: activeTemplate.buildStory(fullAnswers, language, String(sessionId || 'local'), String(Math.random())),
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

      const isStory = parsedStoryMode;
      const isLastRound = currentRound === gameLength;

      await updatePlayer(playerId, { players_status: isLastRound ? 'finished' : 'playing' });
      refreshState();
      const curAnswers = await getAnswersByRound(currentRoundId);
      setAppState(prev => ({ ...prev, joinedCount: curAnswers.length }));
      setAppState(prev => ({ ...prev, totalCount: playerCount > 0 ? playerCount : players.length }));
      setIsTransitioning(false);

      // Story Mode OR Single-player: advance immediately to next question without waiting
      if ((parsedStoryMode || totalCount <= 1) && currentRound < gameLength) {
        const nextRoundNum = currentRound + 1;
        // Find the next round that should have been pre-created
        const nextRound = (rounds || []).find(r => r.round_number === nextRoundNum);

        setAppState(prev => ({
          ...prev,
          phase: Phases.Main,
          currentRound: nextRoundNum,
          currentRoundId: nextRound?.id || prev.currentRoundId, // Fallback to current if not found yet (refresh will fix)
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
      {roomCode && !didGameStart && (isCreatingLobby || isLobby) && phase !== Phases.Join && phase !== Phases.History && phase !== Phases.End && !isCreatingLobby && (
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
          <div className="create-game-pc-code-wrapper">
            {roomCode && <GameCode code={roomCode} className="gameCodePos create-code-mobile" />}
          </div>
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
                <h3 className="template-title" style={{ marginBottom: "15px", whiteSpace: "nowrap", textAlign: "center" }}>{t('CHOOSE_STORY')}</h3>
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
                    <label className={`toggle-option ${colorHighlight ? 'toggle-option--active' : ''}`} onClick={() => setAppState(prev => ({ ...prev, colorHighlight: !prev.colorHighlight }))}>
                      <span className="toggle-label">🎨 {t('OPTS_HIGHLIGHTS' as any)}</span>
                      <div className="toggle-switch">
                        <div className={`toggle-knob ${colorHighlight ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {/* Hints */}
                    <label className={`toggle-option ${hintsEnabled ? 'toggle-option--active' : ''}`} onClick={() => setAppState(prev => ({ ...prev, hintsEnabled: !prev.hintsEnabled }))}>
                      <span className="toggle-label">💡 {t('OPTS_HINTS' as any)}</span>
                      <div className="toggle-switch">
                        <div className={`toggle-knob ${hintsEnabled ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {/* Story Mode */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <label className={`toggle-option ${storyMode ? 'toggle-option--active' : ''}`} onClick={() => setAppState(prev => ({ ...prev, storyMode: !prev.storyMode }))}>
                        <span className="toggle-label">🕹 {t('STORY_MODE' as any)}</span>
                        <div className="toggle-switch">
                          <div className={`toggle-knob ${storyMode ? 'toggle-knob--on' : ''}`} />
                        </div>
                      </label>
                      {storyMode && <div className="story-mode-desc-container"><p className="story-mode-desc">{t('STORY_MODE_DESC' as any)}</p></div>}
                    </div>
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
              <h2 className="lobby-text">
                {t('YOUR_NICK')} <span
                  className={`${getNicknameClassName(playerColor)} ${!parsedColorHighlight ? 'no-highlight' : ''}`}
                  style={parsedColorHighlight ? getNicknameStyle(playerColor) : { color: '#000000', textShadow: 'none' }}
                >
                  {nickname}
                </span>
              </h2>
              <h3 className="lobby-subtitle">{t('PLAYER_LIST')}</h3>
              <div className="players-list">
                {players.length > 0 ? (
                  players.map((p, i) => (
                    <PlayerItem
                      key={p.id || String(i)}
                      p={p}
                      i={i}
                      isMe={String(p.id) === String(playerId) || (i === 0 && nickname === p.nickname)}
                      playerColor={playerColor}
                      cycleColor={cycleColor}
                      AVAILABLE_COLORS={AVAILABLE_COLORS}
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
                    AVAILABLE_COLORS={AVAILABLE_COLORS}
                    crownImage={crownImage}
                    showColorPicker={parsedColorHighlight}
                  />
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
          <WaitCard
            nick={nickname}
            playerColor={playerColor}
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
            hints={parsedHintsEnabled ? (activeTemplate.fallbacks[currentRound - 1] || []) : undefined}
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
