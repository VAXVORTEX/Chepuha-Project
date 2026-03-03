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
import GameResult from "./components/GameResult/GameResult";
import logoImage from "./assets/images/Logo.png";
import logoImageEng from "./assets/images/Chepuha_eng.png";
import homeImage from "./assets/images/house.png";
import crownImage from "./assets/images/crown.png";
import flagUk from "./assets/images/flag_uk.png";
import flagEn from "./assets/images/flag_en.png";
import { useHistory, SavedGame } from "./hooks/useHistory";
import { playSecretMusic, secretAudio } from "./utils/audio";
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
import HomeIcon from "./components/HomeIcon/HomeIcon";
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
}
function App() {
  const [appState, setAppState] = useState<AppState>({
    phase: Phases.Main,
    didGameStart: false,
    currentRound: 1,
    userAnswers: [],
    isCreatingLobby: false,
    isLobby: false,
    nickname: localStorage.getItem('chepuhaUserPrefs') ? JSON.parse(localStorage.getItem('chepuhaUserPrefs')!).nickname || '' : '',
    roomCode: localStorage.getItem('chepuhaUserPrefs') ? JSON.parse(localStorage.getItem('chepuhaUserPrefs')!).roomCode || '' : '',
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
    lobbyCreatedAt: null
  });

  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return;
    fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET' })
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

  const { phase, didGameStart, currentRound, userAnswers, isCreatingLobby, isLobby, nickname, roomCode, selectedTemplate, error, allStories, storyIndex, selectedHistoryGame, joinedCount, totalCount, sessionId, playerId, isHost, currentRoundId, myStorySheetId, playerCount, roundStartedAt, allStorySheets, lobbyCreatedAt } = appState;
  const { session, players, rounds, currentAnswers, activeRoundId: hookActiveRoundId, error: pollError, refreshState } = useGameState(sessionId);
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
  useEffect(() => {
    if (sessionId && playerId && nickname) {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({
        sessionId,
        playerId,
        nickname,
        roomCode,
        isHost,
        selectedTemplate,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(STATE_STORAGE_KEY);
    }
  }, [sessionId, playerId, nickname, roomCode, isHost, selectedTemplate]);

  useEffect(() => {
    if (nickname || roomCode) {
      localStorage.setItem('chepuhaUserPrefs', JSON.stringify({ nickname, roomCode }));
    }
  }, [nickname, roomCode]);

  useEffect(() => {
    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setAppState(prev => ({
            ...prev,
            sessionId: parsed.sessionId ? String(parsed.sessionId) : null,
            playerId: parsed.playerId ? String(parsed.playerId) : null,
            nickname: parsed.nickname,
            roomCode: parsed.roomCode,
            isHost: parsed.isHost,
            selectedTemplate: parsed.selectedTemplate || "classic",
            isLobby: true
          }));
        } else {
          localStorage.removeItem(STATE_STORAGE_KEY);
        }
      } catch (err) { }
    }
  }, []);

  useEffect(() => {
    const imagesToPreload = [
      logoImage, logoImageEng, homeImage, crownImage, flagUk, flagEn,
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
    if (isTransitioning || transitionLockRef.current) return;

    const sorted = [...(rounds || [])].sort((a: any, b: any) => b.round_number - a.round_number);
    const latestRound = sorted[0];
    const myPlayer = players.find(p => p.id === playerId);

    if (!latestRound || !myPlayer) return;

    if (latestRound.round_number > currentRound || !currentRoundId) {
      let newPhase = Phases.Main;

      if (myPlayer.players_status === 'ready' && currentAnswers.some(a =>
        (typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : String(a.player_id)) === playerId &&
        (typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : String(a.round_id)) === latestRound.id
      )) {
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
        joinedCount: 0
      }));
    } else if (latestRound.id === currentRoundId) {
      if (phase === Phases.Main && currentAnswers.some(a =>
        (typeof a.player_id === 'object' && a.player_id !== null ? (a.player_id as any).id : String(a.player_id)) === playerId &&
        (typeof a.round_id === 'object' && a.round_id !== null ? (a.round_id as any).id : String(a.round_id)) === currentRoundId
      )) {
        setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      } else if (myPlayer.players_status === 'finished' && phase !== Phases.End && phase !== Phases.History) {
        fetchFinalStoryResult();
        setAppState(prev => ({ ...prev, phase: Phases.End }));
      }
    }
  }, [didGameStart, playerId, players, phase, sessionId, currentRound, currentRoundId, currentAnswers, rounds, isTransitioning, fetchFinalStoryResult]);
  useEffect(() => {
    if (!session || !sessionId) return;
    if (session.session_status === 'active' && isLobby && !didGameStart) {
      setAppState(prev => ({ ...prev, didGameStart: true }));
      setAppState(prev => ({ ...prev, isLobby: false }));
      setAppState(prev => ({ ...prev, phase: Phases.Main }));
    }
  }, [session?.session_status, isLobby, didGameStart, sessionId]);
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
  }, [session?.session_status, sessionId, playerId, players.length]);
  useEffect(() => { currentRoundIdRef.current = currentRoundId; }, [currentRoundId]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const [lobbyTimeLeft, setLobbyTimeLeft] = useState(25 * 60);

  useEffect(() => {
    if (isLobby) {
      const start = lobbyCreatedAt || Date.now();
      if (!lobbyCreatedAt) {
        setAppState(prev => ({ ...prev, lobbyCreatedAt: start }));
      }
      const tick = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
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
  }, [isLobby, lobbyCreatedAt]);

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

        if (total < 2) return;

        const now = Date.now();
        const startedAt = roundStartedAt ? Date.parse(roundStartedAt) : now;
        const timePassed = (now - startedAt) / 1000;

        if (curAnswers.length >= total || (isHost && timePassed > 130)) {
          // CRITICAL: Only HOST should trigger round transitions
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

          if (currentRound < activeTemplate.questions.length) {
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
              await updatePlayersBySession(sessionId, { players_status: 'playing' });
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
    setAppState(prev => ({ ...prev, phase: Phases.Main }));
    setAppState(prev => ({ ...prev, didGameStart: false }));
    setAppState(prev => ({ ...prev, isCreatingLobby: false }));
    setAppState(prev => ({ ...prev, isLobby: false }));
    setAppState(prev => ({ ...prev, error: "" }));
    setAppState(prev => ({ ...prev, currentRound: 1 }));
    setAppState(prev => ({ ...prev, userAnswers: [] }));
    setAppState(prev => ({ ...prev, sessionId: null }));
    setAppState(prev => ({ ...prev, playerId: null }));
    setAppState(prev => ({ ...prev, isHost: false }));
    setAppState(prev => ({ ...prev, currentRoundId: null }));
    setAppState(prev => ({ ...prev, myStorySheetId: null }));
    setAppState(prev => ({ ...prev, selectedHistoryGame: null }));
    setAppState(prev => ({ ...prev, lobbyCreatedAt: null }));
    localStorage.removeItem(STATE_STORAGE_KEY);
  };
  const doShowCreateScreen = () => {
    setAppState(prev => ({ ...prev, roomCode: generateRoomCode() }));
    setAppState(prev => ({ ...prev, isCreatingLobby: true }));
    setAppState(prev => ({ ...prev, isLobby: false }));
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
    setAppState(prev => ({ ...prev, phase: Phases.Join }));
    setAppState(prev => ({ ...prev, didGameStart: false }));
    setAppState(prev => ({ ...prev, isCreatingLobby: false }));
  };
  const handleJoinGame = async (nick: string, code: string) => {
    try {
      const allSessions = await getGameSessions();
      const targetSession = allSessions.find(s => s.session_name === code && s.session_status !== 'completed');
      if (!targetSession) {
        return setAppState(prev => ({ ...prev, error: String(t('ERR_NOT_FOUND' as any)) }));
      }

      setAppState(prev => ({ ...prev, nickname: nick }));
      setAppState(prev => ({ ...prev, roomCode: code }));
      setAppState(prev => ({ ...prev, sessionId: targetSession.id }));

      const existingPlayers = await getPlayersBySession(targetSession.id);
      const existingPlayer = existingPlayers.find((p: Player) => p.nickname.toLowerCase() === nick.toLowerCase());

      if (targetSession.session_status === 'active' && !existingPlayer) {
        return setAppState(prev => ({ ...prev, error: String(t('ERR_NOT_FOUND' as any)) }));
      }

      if (existingPlayer) {
        setAppState(prev => ({
          ...prev,
          playerId: existingPlayer.id,
          isHost: existingPlayer.player_order === 1,
          isLobby: targetSession.session_status === 'waiting',
          didGameStart: targetSession.session_status === 'active',
          phase: targetSession.session_status === 'active' ? Phases.Main : Phases.Main
        }));
      } else {
        const guest = await createPlayer({
          nickname: nick,
          session_id: targetSession.id,
          players_status: 'joined',
        });
        setAppState(prev => ({ ...prev, playerId: guest.id }));
        setAppState(prev => ({ ...prev, isHost: false }));
        setAppState(prev => ({ ...prev, isLobby: true }));
        setAppState(prev => ({ ...prev, didGameStart: false }));
      }

      setAppState(prev => ({ ...prev, isCreatingLobby: false }));
      if (targetSession.session_status === 'active') {
        setAppState(prev => ({ ...prev, phase: Phases.Main, isLobby: false, didGameStart: true }));
      } else {
        setAppState(prev => ({ ...prev, phase: Phases.Main }));
      }
      await refreshState();
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_JOIN' as any)) + err.message }));
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

      // 4. FINALLY activate the session (Atomic Start)
      // Guests watching realtime will see everything is ready when this changes
      await updateGameSession(sessionId, {
        session_status: 'active',
        max_players: players.length
      });

      // Update local state
      setAppState(prev => ({
        ...prev,
        playerCount: players.length,
        currentRoundId: firstRound.id,
        roundStartedAt: ts,
        didGameStart: true,
        isLobby: false,
        phase: Phases.Main,
        currentRound: 1,
        userAnswers: [],
        totalCount: players.length
      }));
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_START' as any)) + err.message }));
    }
  };
  const doShowHistory = () => {
    setAppState(prev => ({ ...prev, phase: Phases.History }));
  };
  const doAnswerSubmit = async (answer: string) => {
    const isMissing = answer.trim() === "" || answer.trim() === "Час вийшов";
    const fallbackPool = activeTemplate.fallbacks[currentRound - 1] ?? [""];
    const cleanAnswer = isMissing
      ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
      : answer;
    const updatedAnswers = [...userAnswers, cleanAnswer];
    setAppState(prev => ({ ...prev, userAnswers: updatedAnswers }));
    if (!currentRoundId || !playerId || !sessionId) {
      setIsTransitioning(false);
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      setTimeout(() => {
        if (currentRound < activeTemplate.questions.length) {
          setAppState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
          setIsTransitioning(false);
          setAppState(prev => ({ ...prev, phase: Phases.Main }));
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
      }, 2000);
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
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    } catch (err: any) {
      setIsTransitioning(false);
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    }
  };
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
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
          <div className="create-game-container">
            <div className="input-wrapper">
              <input
                type="text"
                className={`nickname-input ${error ? "error" : ""}`}
                placeholder={t('ENTER_NICK_PLACEHOLDER')}
                value={nickname}
                onChange={handleNicknameChange}
              />
            </div>
            <span className="error-message" style={{ minHeight: '24px', display: 'block' }}>{error || '\u00A0'}</span>
            <div className="template-selector">
              <h3 className="template-title">{t('CHOOSE_STORY')}</h3>
              <div className="template-cards-container">
                {Object.values(TEMPLATES).map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`template-card ${selectedTemplate === tpl.id ? 'active' : ''}`}
                    onClick={() => setAppState(prev => ({ ...prev, selectedTemplate: tpl.id }))}
                  >
                    <div className="template-card-content">
                      <h4 className="template-name">{t(tpl.id.toUpperCase() as any) || tpl.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              label={t('CREATE_GAME')}
              variant="primary"
              phase={phase}
              onClick={goToLobby}
            />
          </div>
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}
      {!didGameStart && isLobby && phase !== Phases.Join && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
          <div className="lobby-timer-display">
            <span className="timer-title">{t('LOBBY_TIMER_TITLE' as any)}</span>
            <span className="timer-time">
              {Math.ceil(lobbyTimeLeft / 60)}
            </span>
          </div>
          <div className="lobby-container">
            <div className="lobby-info">
              <h2 className="lobby-text">{t('YOUR_NICK')} {nickname}</h2>
              <h3 className="lobby-subtitle">{t('PLAYER_LIST')}</h3>
              <div className="players-list">
                {players.length > 0 ? (
                  players.map((p, i) => (
                    <div key={p.id || String(i)} className="player-item">
                      <div className="player-name-wrapper">
                        {i === 0 && <img src={crownImage} alt="Host" className="crown-icon" />}
                        <span className="player-name">{p.nickname}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="player-item">
                    <div className="player-name-wrapper">
                      <img src={crownImage} alt="Host" className="crown-icon" />
                      <span className="player-name">{nickname}</span>
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
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}
      {phase === Phases.Join && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
          <JoinCard
            initialNick={nickname}
            initialRoom={roomCode}
            onJoin={handleJoinGame}
            errors={error ? { room: error } : undefined}
          />
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}

      {didGameStart && phase === Phases.Waiting && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
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
            initialSeconds={roundStartedAt
              ? Math.max(0, 120 - Math.floor(((Date.now() - serverTimeOffset) - Date.parse(roundStartedAt)) / 1000))
              : 120
            }
            onTimeUp={() => doAnswerSubmit("Час вийшов")}
            className="timerPos"
          />
          <Round currentRound={currentRound} totalRounds={activeTemplate.questions.length} className="roundPos" />
          <RoundCard
            playerName={nickname}
            phase={phase}
            question={
              activeTemplate.id === 'chaos'
                ? TEMPLATES[
                  ["classic", "new_year", "halloween", "summer", "student", "gaming", "romance", "chaos"][
                  Math.abs(String((sessionId || "") + (playerId || nickname || "Guest")).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) + (currentRound || 0)) % 8
                  ]
                ]?.questions[currentRound - 1] || activeTemplate.questions[currentRound - 1]
                : activeTemplate.questions[currentRound - 1]
            }
            playerReady={derivedJoinedCount}
            playerTotal={derivedTotalCount}
            onSubmitAnswer={doAnswerSubmit}
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
    </div>
  );
}
export default App;
