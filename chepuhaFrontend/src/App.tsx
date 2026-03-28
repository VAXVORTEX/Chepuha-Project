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
    playerColor: '',
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

export const AVAILABLE_COLORS = [
  // Plain colors by hue: red → orange → yellow → green → blue → purple → neutrals
  '#e52929', '#ff4e50', '#8b0000',
  '#ff8c00', '#ffa500', '#e5a629',
  '#ffd700', '#ffff00', '#f9d423', '#fafad2',
  '#29a62b', '#24c431', '#00ff00', '#32cd32', '#008000', '#adff2f', '#98fb98', '#00fa9a',
  '#2962e5', '#2c5ed3', '#00bfff', '#0000ff', '#00008b', '#4682b4', '#87ceeb', '#add8e6',
  '#9c29e5', '#8a2be2', '#4b0082', '#9932cc', '#ba55d3', '#e6e6fa',
  '#000000', '#ffffff',

  // Flags
  'special:flag-ua', 'special:flag-de', 'special:flag-jp', 'special:flag-pl',
  'special:flag-it', 'special:flag-es', 'special:flag-br', 'special:flag-ca',
  'special:flag-bi', 'special:flag-pan', 'special:flag-ace', 'special:flag-nonbinary',

  // Gender/pride
  'special:gender-pride', 'special:gender-trans', 'special:flag-lesbian',
  'special:flag-gay-mlm',
  'special:flag-intersex', 'special:flag-genderqueer', 'special:flag-polysexual',

  // Static gradients (ordered by warmth: fire → gold → ice)
  'special:fire-gradient', 'special:gold', 'special:ice-gradient',

  // Animated gradients (ordered by hue: warm → cool)
  'special:rainbow', 'special:solar', 'special:nebula', 'special:cyberpunk',
  'special:pirate-caribbean', 'special:cyber-samurai-iconic',

  // Premium animated gradients (ordered: warm reds → golds → greens → blues → pinks → neutrals)
  'special:royal-red', 'special:golden-rod', 'special:bronze-age',
  'special:mint-fresh', 'special:stellar', 'special:cyan-burst', 'special:electric-blue', 'special:deep-purple',
  'special:neon-pink', 'special:silver-streak'
];

const GAME_LENGTH_INDICES: Record<number, number[]> = {
  6: [0, 1, 2, 3, 4, 5],
  9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

const getNicknameStyle = (color: string) => {
  const isDark = color === '#000000' || color === '#000' || color === '#8b0000' || color === '#4b0082';
  const isSpecial = color?.startsWith('special:');
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;

  if (isSpecial) {
    return { textShadow: 'none' };
  }

  return {
    color: color || '#000000',
    textShadow: isDark ? 'none' : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    WebkitTextStroke: isDark ? 'none' : (isPC ? '0.5px black' : '0.3px black')
  } as React.CSSProperties;
};

const getNicknameClassName = (color: string) => {
  if (color?.startsWith('special:')) {
    return `player-name ${color.replace('special:', '')}-text`;
  }
  return 'player-name';
};


const getFontSize = (text: string, baseSizeArg: number = 24) => {
  if (!text) return undefined;
  const len = text.length;
  const isPC = window.innerWidth > 768;

  const baseSize = isPC ? 90 : 54;

  if (len <= 6) return `${baseSize}px`;


  const scaleFactor = 6 / len;

  const minSize = isPC ? 36 : 18;
  const calculatedSize = Math.max(minSize, Math.floor(baseSize * Math.pow(scaleFactor, 0.6)));
  return `${calculatedSize}px`;
};

const renderThemedNickname = (name: string, color: string, defaultSize: number = 36, showHighlight: boolean = true) => {
  const themeClass = getNicknameClassName(color);
  const theme = color.startsWith('special:') ? color.replace('special:', '') : '';
  const style = showHighlight ? getNicknameStyle(color) : { color: '#000000', textShadow: 'none' };
  const fontSize = getFontSize(name, defaultSize);

  const content = (
    <span className={themeClass + (!showHighlight ? ' no-highlight' : '') + " notranslate"} translate="no" style={{ ...style, fontSize }}>
      {name}
    </span>
  );

  if (showHighlight && (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic')) {
    return (
      <span className={`${theme}-bg inline-wrapper`}>
        {content}
      </span>
    );
  }

  return content;
};


const PlayerItem = memo(({ p, i, isMe, playerColor, cycleColor, AVAILABLE_COLORS, crownImage, showColorPicker }: any) => {
  const defaultColor = AVAILABLE_COLORS[i % AVAILABLE_COLORS.length];
  const activeColor = isMe && playerColor ? playerColor : (p.color || defaultColor);

  return (
    <div key={p.id || String(i)} className="player-item" data-player-id={p.id}>
      <div className="player-name-wrapper">
        {i === 0 && <img src={crownImage} alt="Host" className="crown-icon" />}
        {renderThemedNickname(p.nickname, activeColor, 36, showColorPicker)}
        {isMe && showColorPicker && (
          <div className="inline-color-picker">
            <button className="inline-color-arrow" onClick={() => cycleColor(-1)}>◀</button>
            <div className={classNames("inline-color-swatch", activeColor?.startsWith('special:') ? activeColor.replace('special:', '') : '')} style={!activeColor?.startsWith('special:') ? { background: activeColor } : {}} />
            <button className="inline-color-arrow" onClick={() => cycleColor(1)}>▶</button>
          </div>
        )}
      </div>
    </div>
  );
});


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

  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const playersListRef = useRef<HTMLDivElement>(null);

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
      .catch(err => {
        console.warn("Failed to fetch server time offset:", err);
      });
  }, []);

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
      hookMatch ? Math.max(joinedCount, currentAnswers.length) : joinedCount,
      derivedTotalCount > 0 ? derivedTotalCount : Infinity
    );

  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language || 'uk';
  }, [language]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);
  const currentRoundIdRef = useRef(currentRoundId);
  const currentRoundRef = useRef(currentRound);

  const activeTemplate = TEMPLATES[actualTemplateKey] || TEMPLATES.classic;
  const { savedGames, saveGameToHistory } = useHistory();


  const CAROUSEL_TEMPLATES = ['random', ...Object.keys(TEMPLATES)];
  const [carouselIndex, setCarouselIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem('chepuhaCarouselIdx');
    if (savedIdx !== null) return parseInt(savedIdx, 10);
    return 0;
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
  };


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
    if (isHost && sessionId && isLobby) {
      const packedTemplate = `${selectedTemplate}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;
      updateGameSession(sessionId, { template: packedTemplate }).catch(err => {
        console.error("Failed to update game session template:", err);
      });
    }
  }, [isHost, sessionId, isLobby, selectedTemplate, gameLength, storyMode, hintsEnabled, colorHighlight]);


  useEffect(() => {
    if (sessionId && playerId && playerColor) {
      updatePlayer(playerId, { color: playerColor }).catch((err) => {
        if (String(err.message).includes('column') || String(err.message).includes('schema cache')) {
          // Expected during DB migration
        } else {
          console.error("Failed to update player color sync:", err);
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
      const built = (sheets || [])

        .map(s => {
          const sorted = [...(s.answers || [])].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
          const p = s.player_id as any;

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
            const roundIndex = indices.indexOf(idx);
            const originalAnswer = roundIndex !== -1
              ? (s.answers || []).find((a: any) => a.position_in_sheet === (roundIndex + 1))
              : null;


            if (!originalAnswer) {
              return `<span lang="uk" style="color: #ffffff; font-weight: normal; text-shadow: none; -webkit-text-stroke: none; opacity: 0.9;">${ans}</span>`;
            }
            const ansOwnerId = typeof originalAnswer.player_id === 'object' ? originalAnswer.player_id.id : originalAnswer.player_id;
            const ansOwner = typeof originalAnswer.player_id === 'object' ? originalAnswer.player_id : players.find(p => String(p.id) === String(ansOwnerId));
            const color = ansOwner?.color || (String(ansOwnerId) === String(playerId) ? playerColor : '#e52929');
            const isSpecial = color?.startsWith('special:');
            let style = `color: ${isSpecial ? 'transparent' : color}; font-weight: bold;`;
            let className = '';

            if (isSpecial) {
              const theme = color.replace('special:', '');
              className = ` class="${theme}-text"`;
              style = 'color: transparent;';
              const storyBgClass = theme === 'pirate-caribbean' ? 'story-pirate-bg' : (theme === 'cyber-samurai-iconic' ? 'story-samurai-bg' : `${theme}-bg`);
              if (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic') {
                return `<span class="${storyBgClass} inline-wrapper"><span lang="uk"${className}>${ans}</span></span>`;
              }
            } else {
              const isDark = color === '#000000' || color === '#000' || color === '#8b0000' || color === '#4b0082';
              const shadow = isDark 
                ? '0 0 2px #fff, 0 0 5px rgba(255,255,255,0.5)' 
                : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.5)';
              const stroke = isDark ? '-webkit-text-stroke: 0.5px #fff;' : '-webkit-text-stroke: 1.5px black;';
              style += ` text-shadow: ${shadow}; ${stroke}`;
            }
            return `<span lang="uk"${className} style="${style}">${ans}</span>`;
          });

          const sheetOwner = players.find(p => String(p.id) === String(sheetOwnerId));
          const sheetOwnerColor = sheetOwner?.color || (String(sheetOwnerId) === String(playerId) ? (playerColor || '#ffffff') : '#ffffff');

          return {
            playerName: nick,
            story: activeTemplate.buildStory(coloredAnswers, language, String(sessionId || 'local'), String(s.id || Math.random())),
            answers: fullAnswers,
            templateId: activeTemplate.id,
            playerColor: sheetOwnerColor
          };
        });

      if (built.length > 0) {

        const hasAnySheets = built.length > 0;
        if (!hasAnySheets) return;

        setAppState(prev => ({ ...prev, allStories: built }));

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
      } else if (myPlayer.players_status === 'finished' && phase !== Phases.End && phase !== Phases.History) {
        if (!transitionLockRef.current) {
          fetchFinalStoryResult();
          setAppState(prev => ({ ...prev, phase: Phases.End }));
        }
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
          if (gameLength === 6) maxTime = 480;
          else if (gameLength === 9) maxTime = 720;
          else if (gameLength === 12) maxTime = 900;
        }

        const isStory = !!(session?.template?.split('|')[2] === '1' || storyMode);
        const allFinished = isStory && freshPlayers.every(p => p.players_status === 'finished');



        const shouldTransition = (!isStory && (curAnswers.length >= total || (isHost && timePassed > maxTime))) ||
          (isStory && (allFinished || (isHost && timePassed > 1800)));

        if (shouldTransition) {
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
              const nextRound = await safeApiCall(createRound, {
                session_id: sessionId,
                round_number: nextRoundNum,
                question_type: activeTemplate.questionTypes[GAME_LENGTH_INDICES[gameLength]?.[nextRoundNum - 1] ?? (nextRoundNum - 1)],
                rounds_status: 'active',
                started_at: ts,
              });
              if (!nextRound) return;
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

  const handleNicknameChange = (value: string) => {
    if (value.length <= 25) {
      setAppState(prev => ({ ...prev, nickname: value, error: "" }));
    } else {
      setAppState(prev => ({ ...prev, error: String(t('ERR_NICK_LONG' as any)) }));
    }
  };

  const goToLobby = async () => {
    if (!nickname || !nickname.trim()) {
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
    try {
      let gameTemplate = activeTemplate;
      if (selectedTemplate === 'random') {
        const keys = Object.keys(TEMPLATES);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        gameTemplate = TEMPLATES[randomKey];
        const packed = `${randomKey}|${gameLength}|${storyMode ? '1' : '0'}|${hintsEnabled ? '1' : '0'}|${colorHighlight ? '1' : '0'}`;
        await updateGameSession(sessionId, { template: packed });
      }

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

      const targetGameLength = session?.template ? (parseInt(session.template.split('|')[1]) as 6 | 9 | 12) : gameLength;

      let firstRoundId = "";
      if (storyMode) {

        const targetIndices = GAME_LENGTH_INDICES[targetGameLength] || GAME_LENGTH_INDICES[12];
        for (let i = 0; i < targetGameLength; i++) {
          const created = await safeApiCall(createRound, {
            session_id: sessionId,
            round_number: i + 1,
            question_type: gameTemplate.questionTypes[targetIndices[i] ?? i] as QuestionType,
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
          question_type: gameTemplate.questionTypes[GAME_LENGTH_INDICES[targetGameLength]?.[0] ?? 0] as QuestionType,
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
    const fallbackPool = activeTemplate.fallbacks[currentRound - 1] ?? [""];
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
    <div className="app-view">
      {roomCode && !didGameStart && isLobby && phase !== Phases.Join && phase !== Phases.History && phase !== Phases.End && (
        <div className="create-game-pc-code-wrapper">
          <GameCode code={roomCode} className="gameCodePos create-code-mobile" />
        </div>
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
            <div className="input-card" style={{ pointerEvents: 'auto' }}>
              <Input
                value={nickname}
                onChange={handleNicknameChange}
                placeholder={t('ENTER_NICK_PLACEHOLDER')}
                className={`nickname-input ${error ? "error" : ""}`}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && goToLobby()}
              />
            </div>
            <span className="error-message" style={{ minHeight: '24px', display: 'block', pointerEvents: 'auto' }}>{error || '\u00A0'}</span>

            {}
            <div className="create-options-row" style={{ pointerEvents: 'auto' }}>

              {}
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

              {}
              <div className="game-settings-container">
                <div className="game-settings-section">

                  {}
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

                  {}
                  <div className="extra-options">
                    {}
                    <label className={`toggle-option ${colorHighlight ? 'toggle-option--active' : ''}`} onClick={() => setAppState(prev => ({ ...prev, colorHighlight: !prev.colorHighlight }))}>
                      <span className="toggle-label">🎨 {t('OPTS_HIGHLIGHTS' as any)}</span>
                      <div className="toggle-switch">
                        <div className={`toggle-knob ${colorHighlight ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {}
                    <label className={`toggle-option ${hintsEnabled ? 'toggle-option--active' : ''}`} onClick={() => setAppState(prev => ({ ...prev, hintsEnabled: !prev.hintsEnabled }))}>
                      <span className="toggle-label">💡 {t('OPTS_HINTS' as any)}</span>
                      <div className="toggle-switch">
                        <div className={`toggle-knob ${hintsEnabled ? 'toggle-knob--on' : ''}`} />
                      </div>
                    </label>

                    {}
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
              <h2 className="lobby-text label-and-nick notranslate" translate="no">
                <span className="label-part">{t('YOUR_NICK')}</span>
                <div className="nick-scroll-container">
                  {renderThemedNickname(nickname, playerColor, 64, parsedColorHighlight)}
                </div>
              </h2>
              <h3 className="lobby-subtitle">{t('PLAYER_LIST')}</h3>
              <div 
                ref={playersListRef}
                className={`players-list ${(players.length >= 4) ? 'has-many-players' : ''}`}
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
            hints={parsedHintsEnabled ? (activeTemplate.fallbacks[currentRound - 1] || []) : undefined}
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
          onNext={() => setAppState(prev => ({ ...prev, storyIndex: Math.min(prev.allStories.length - 1, prev.storyIndex + 1) }))}
          myNickname={nickname || "Гравець"}
          phase={phase}
          onHome={() => setAppState(prev => ({ ...prev, selectedHistoryGame: null }))}
        />
      )}

      {(isCreatingLobby || isLobby || phase === Phases.Join || (didGameStart && phase === Phases.Waiting)) && phase !== Phases.End && phase !== Phases.History && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
        </>
      )}

      {}
      {(isCreatingLobby || isLobby || phase === Phases.Join) && phase !== Phases.End && phase !== Phases.History && (
        <HomeIcon onClick={goHome} className="homeIconPos" />
      )}
    </div>
  );
}

export default App;