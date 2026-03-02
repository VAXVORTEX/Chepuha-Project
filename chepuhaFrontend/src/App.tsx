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
  submitAnswer,
  getAnswersByRound,
  QuestionType,
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
    allStorySheets: []
  });
  const { phase, didGameStart, currentRound, userAnswers, isCreatingLobby, isLobby, nickname, roomCode, selectedTemplate, error, allStories, storyIndex, selectedHistoryGame, joinedCount, totalCount, sessionId, playerId, isHost, currentRoundId, myStorySheetId, playerCount, roundStartedAt, allStorySheets } = appState;
  const { session, players, rounds, currentAnswers, activeRoundId: hookActiveRoundId, error: pollError, refreshState } = useGameState(sessionId);
  const hookMatch = hookActiveRoundId && currentRoundId && hookActiveRoundId === currentRoundId;
  const derivedJoinedCount = hookMatch ? Math.max(joinedCount, currentAnswers.length) : joinedCount;
  const derivedTotalCount = totalCount > 0 ? totalCount : (players?.length || 0);
  const activeTemplate = TEMPLATES[session?.template || selectedTemplate] || TEMPLATES.classic;
  const { t, language, setLanguage } = useLanguage();
  const transitionLockRef = useRef(false);
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

  // Persist user preferences (survives game end)
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

  // Asset Preloading
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
    // Warm up audio
    playSecretMusic();
    setTimeout(() => {
      if (secretAudio && !secretAudio.paused) secretAudio.pause();
    }, 50);
  }, []);
  const fetchFinalStoryResult = useCallback(async () => {
    if (!sessionId) return;
    try {
      const sheets = await getStorySheetsBySession(sessionId);
      const built = sheets
        .filter(s => s.answers && s.answers.length > 0)
        .map(s => {
          const sorted = [...s.answers!].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
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

  // SERVER-AUTHORITATIVE: Read player's status from DB to determine correct phase
  useEffect(() => {
    if (!didGameStart || !playerId || !players.length || !sessionId) return;
    const myPlayer = players.find(p => p.id === playerId);
    if (!myPlayer) return;

    if (myPlayer.players_status === 'playing' && !currentRoundId) {
      // Game started but we don't have a round yet (timing: session became active before round was created)
      (async () => {
        try {
          const roundsList = await getRoundsBySession(sessionId);
          const sorted = [...roundsList].sort((a: any, b: any) => b.round_number - a.round_number);
          const latestRound = sorted[0];
          if (latestRound) {
            setAppState(prev => ({
              ...prev,
              currentRoundId: latestRound.id,
              currentRound: latestRound.round_number,
              roundStartedAt: latestRound.started_at || prev.roundStartedAt,
              joinedCount: 0,
              phase: Phases.Main,
            }));
          }
        } catch (e) { }
      })();
    } else if (myPlayer.players_status === 'playing' && phase === Phases.Waiting && currentRoundId) {
      // Status changed from waiting → playing = new round started!
      // GUARD: Only transition if the DB actually has a NEWER round than what we're on
      (async () => {
        try {
          const roundsList = await getRoundsBySession(sessionId);
          const sorted = [...roundsList].sort((a: any, b: any) => b.round_number - a.round_number);
          const latestRound = sorted[0];
          if (latestRound && latestRound.round_number > currentRound) {
            setAppState(prev => ({
              ...prev,
              currentRoundId: latestRound.id,
              currentRound: latestRound.round_number,
              roundStartedAt: latestRound.started_at || prev.roundStartedAt,
              joinedCount: 0,
              phase: Phases.Main,
            }));
          }
        } catch (e) { }
      })();
    } else if (myPlayer.players_status === 'ready' && phase === Phases.Main) {
      // Player already answered this round → show waiting
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    } else if (myPlayer.players_status === 'finished' && phase !== Phases.End && phase !== Phases.History) {
      // Game ended
      fetchFinalStoryResult();
      setAppState(prev => ({ ...prev, phase: Phases.End }));
    }
  }, [didGameStart, playerId, players, phase, sessionId, currentRound, currentRoundId, fetchFinalStoryResult]);
  useEffect(() => {
    if (!session || !sessionId) return;
    if (session.session_status === 'active' && isLobby && !didGameStart) {
      setAppState(prev => ({ ...prev, didGameStart: true }));
      setAppState(prev => ({ ...prev, isLobby: false }));
      setAppState(prev => ({ ...prev, phase: Phases.Main }));
    }
    if (session.session_status === 'completed' && phase !== Phases.End && phase !== Phases.Main && phase !== Phases.History) {
      fetchFinalStoryResult();
      setAppState(prev => ({ ...prev, phase: Phases.End }));
    }
  }, [session?.session_status, isLobby, didGameStart, isHost, phase, fetchFinalStoryResult, sessionId]);
  useEffect(() => {
    if (!session || session.session_status !== 'active' || !sessionId || !playerId) return;

    (async () => {
      try {
        const [rounds, sheets] = await Promise.all([
          getRoundsBySession(sessionId),
          getStorySheetsBySession(sessionId),
        ]);

        const sortedRounds = Array.isArray(rounds) ? [...rounds].sort((a: any, b: any) => b.round_number - a.round_number) : [];
        const activeRound = sortedRounds[0];

        if (activeRound) {
          // Phase is determined by server-authoritative player status, not guessed here
          const myPlayer = players.find(p => p.id === playerId);
          let initialPhase = Phases.Main;
          if (myPlayer?.players_status === 'ready') initialPhase = Phases.Waiting;
          else if (myPlayer?.players_status === 'finished') initialPhase = Phases.End;

          setAppState(prev => ({
            ...prev,
            currentRoundId: activeRound.id,
            currentRound: activeRound.round_number,
            roundStartedAt: activeRound.started_at || prev.roundStartedAt,
            didGameStart: true,
            isLobby: false,
            phase: initialPhase
          }));
        }

        if (sheets.length > 0) {
          setAppState(prev => ({ ...prev, allStorySheets: sheets.map((s: any) => ({ playerId: s.player_id?.id || s.player_id, sheetId: s.id })) }));
        }

        const mySheet = sheets.find((s: any) => (s.player_id?.id || s.player_id) === playerId);
        if (mySheet) setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
        if (players.length > 0) setAppState(prev => ({ ...prev, playerCount: players.length }));
      } catch (err) {
        console.error("Error syncing state on start/re-join:", err);
      }
    })();
  }, [session?.session_status, sessionId, playerId, players.length, rounds.length]);
  useEffect(() => {
    if (!session || !currentRoundId || !sessionId || !didGameStart) return;
    if (phase !== Phases.Waiting && phase !== Phases.Main) return;
    let localPhase: Phases = phase;
    const interval = setInterval(async () => {
      if (transitionLockRef.current) return;
      try {
        const checkRoundId = currentRoundId;
        const [curAnswers, freshPlayers] = await Promise.all([
          getAnswersByRound(currentRoundId),
          getPlayersBySession(sessionId)
        ]);

        // CRITICAL: If roundId changed while fetching, ignore these results to avoid 2/2 stale bug
        if (checkRoundId !== currentRoundId) return;

        // Always use actual player count from DB — session.max_players may be stale
        const total = freshPlayers.length;
        setAppState(prev => ({ ...prev, joinedCount: curAnswers.length, totalCount: total }));

        // Phase is now controlled by players_status from DB, no client-side guessing needed

        // Only process transitions if we are in Waiting phase
        if (localPhase !== Phases.Waiting) return;

        // CRITICAL: Do NOT proceed if players haven't loaded yet
        if (total < 2) return;

        const now = Date.now();
        const startedAt = roundStartedAt ? Date.parse(roundStartedAt) : now;
        const timePassed = (now - startedAt) / 1000;

        // Force progress if everyone answered or timeout
        if (curAnswers.length >= total || (isHost && timePassed > 130)) {
          console.log("[Sync] Triggering transition. Answers:", curAnswers.length, "Total:", total);
          transitionLockRef.current = true;

          if (isHost && curAnswers.length < total) {
            // Host fills missing answers before proceeding
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
              // SERVER-AUTHORITATIVE: Tell ALL players to start answering the new round
              await updatePlayersBySession(sessionId, { players_status: 'playing' });
              localPhase = Phases.Main;
              setAppState(prev => ({
                ...prev,
                currentRoundId: nextRound.id,
                currentRound: nextRoundNum,
                roundStartedAt: ts,
                joinedCount: 0,
                phase: Phases.Main
              }));
              transitionLockRef.current = false;
            } else {
              // Non-host: try to detect the new round via polling
              const rList = await getRoundsBySession(sessionId);
              const nextRound = rList.find((r: any) => r.round_number === currentRound + 1);
              if (nextRound) {
                localPhase = Phases.Main; // Only set AFTER we found the round!
                setAppState(prev => ({
                  ...prev,
                  currentRoundId: nextRound.id,
                  currentRound: currentRound + 1,
                  roundStartedAt: nextRound.started_at || prev.roundStartedAt,
                  joinedCount: 0,
                  phase: Phases.Main
                }));
              }
              // If round not found yet, localPhase stays Waiting → interval retries next tick
              transitionLockRef.current = false;
            }
          } else {
            localPhase = Phases.End;
            if (isHost) {
              // SERVER-AUTHORITATIVE: Tell ALL players the game is finished
              await updatePlayersBySession(sessionId, { players_status: 'finished' });
              await updateGameSession(sessionId, { session_status: 'completed' });
            }
            fetchFinalStoryResult();
            setTimeout(() => {
              transitionLockRef.current = false;
              setAppState(prev => ({ ...prev, phase: Phases.End }));
            }, 1000);
          }
        }
      } catch (err) {
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, session?.id, currentRoundId, playerCount, players.length, currentRound, isHost, sessionId, fetchFinalStoryResult, roundStartedAt, activeTemplate, didGameStart]);
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
        // Re-join existing session
        setAppState(prev => ({
          ...prev,
          playerId: existingPlayer.id,
          isHost: existingPlayer.player_order === 1,
          isLobby: targetSession.session_status === 'waiting',
          didGameStart: targetSession.session_status === 'active',
          phase: targetSession.session_status === 'active' ? Phases.Main : Phases.Main
        }));
      } else {
        // Create new player
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
      await updateGameSession(sessionId, { session_status: 'active', max_players: players.length });
      setAppState(prev => ({ ...prev, playerCount: players.length }));
      const newSheets: { playerId: string, sheetId: string }[] = [];
      for (const p of players) {
        const sheet = await createStorySheet({
          game_session_id: sessionId,
          player_id: p.id,
          storysheets_status: 'in_progress',
        });
        newSheets.push({ playerId: p.id, sheetId: sheet.id });
        if (p.id === playerId) {
          setAppState(prev => ({ ...prev, myStorySheetId: sheet.id }));
        }
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
      // SERVER-AUTHORITATIVE: Tell ALL players to start answering round 1
      await updatePlayersBySession(sessionId, { players_status: 'playing' });
      setAppState(prev => ({ ...prev, currentRoundId: firstRound.id }));
      setAppState(prev => ({ ...prev, roundStartedAt: ts }));
      setAppState(prev => ({ ...prev, didGameStart: true }));
      setAppState(prev => ({ ...prev, isLobby: false }));
      setAppState(prev => ({ ...prev, phase: Phases.Main }));
      setAppState(prev => ({ ...prev, currentRound: 1 }));
      setAppState(prev => ({ ...prev, userAnswers: [] }));
      setAppState(prev => ({ ...prev, totalCount: players.length }));
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
      transitionLockRef.current = false;
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
      setTimeout(() => {
        if (currentRound < activeTemplate.questions.length) {
          setAppState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
          transitionLockRef.current = false;
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
      if (safeSheets.length > 0 && players.length > 0) {
        const sortedPlayers = [...players].sort((a, b) => String(a.id).localeCompare(String(b.id)));
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
      // SERVER-AUTHORITATIVE: Mark this player as done answering
      await updatePlayer(playerId, { players_status: 'ready' });
      // Immediately refresh hook so server-authoritative effect sees 'ready' not stale 'playing'
      refreshState();
      const curAnswers = await getAnswersByRound(currentRoundId);
      setAppState(prev => ({ ...prev, joinedCount: curAnswers.length }));
      setAppState(prev => ({ ...prev, totalCount: playerCount > 0 ? playerCount : players.length }));
      transitionLockRef.current = false;
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    } catch (err: any) {
      console.error("Answer submission failed", err);
      transitionLockRef.current = false;
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    }
  };
  return (
    <div className="app-view">
      {roomCode && !didGameStart && phase !== Phases.Join && phase !== Phases.History && phase !== Phases.End && (
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
          <div className="yellow-guy-bg" />
          <div className="red-guy-bg" />
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
            <div className="error-message" style={{ color: "red", minHeight: '24px' }}>{pollError || '\u00A0'}</div>
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
          <div className="yellow-guy-bg" />
          <div className="red-guy-bg" />
          <JoinCard
            onJoin={handleJoinGame}
          />
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}

      {didGameStart && phase === Phases.Waiting && (
        <WaitCard
          nick={nickname}
          joinedCount={derivedJoinedCount}
          totalCount={derivedTotalCount}
          currentRound={currentRound}
          totalRounds={activeTemplate.questions.length}
          message={t('WAITING_ANSWERS')}
        />
      )}

      {didGameStart && phase === Phases.Main && (
        <>
          <Timer
            key={`${currentRound}-${roundStartedAt}`}
            initialSeconds={roundStartedAt
              ? Math.max(0, 120 - Math.floor((Date.now() - Date.parse(roundStartedAt)) / 1000))
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
                  Math.abs([...(playerId || nickname), currentRound].reduce((a: number, c: any) => a + String(c).charCodeAt(0), 0)) % 8
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
