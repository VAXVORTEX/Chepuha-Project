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
import { playSecretMusic } from "./utils/audio";
const STATE_STORAGE_KEY = "chepuhaActiveGameState";
import { useGameState } from "./hooks/useGameState";
import {
  createGameSession,
  createPlayer,
  updateGameSession,
  createRound,
  createStorySheet,
  submitAnswer,
  getAnswersByRound,
  QuestionType,
  getGameSessions,
  getStorySheetsBySession,
  getRoundsBySession,
} from "./api";
import { TEMPLATES } from "./config/templates";
import { useLanguage } from "./contexts/LanguageContext";
import HomeIcon from "./components/HomeIcon/HomeIcon";
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
  sessionId: number | null;
  playerId: number | null;
  isHost: boolean;
  currentRoundId: number | null;
  myStorySheetId: number | null;
  playerCount: number;
  roundStartedAt: string | null;
  allStorySheets: { playerId: number, sheetId: number }[];
}
function App() {
  const [appState, setAppState] = useState<AppState>({
    phase: Phases.Main,
    didGameStart: false,
    currentRound: 1,
    userAnswers: [],
    isCreatingLobby: false,
    isLobby: false,
    nickname: "",
    roomCode: "",
    selectedTemplate: "classic",
    error: "",
    allStories: [],
    storyIndex: 0,
    selectedHistoryGame: null,
    joinedCount: 1,
    totalCount: 4,
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
  const { session, players, error: pollError, refreshState } = useGameState(sessionId);
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
  useEffect(() => {
    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setAppState(prev => ({ ...prev, sessionId: parsed.sessionId }));
          setAppState(prev => ({ ...prev, playerId: parsed.playerId }));
          setAppState(prev => ({ ...prev, nickname: parsed.nickname }));
          setAppState(prev => ({ ...prev, roomCode: parsed.roomCode }));
          setAppState(prev => ({ ...prev, isHost: parsed.isHost }));
          setAppState(prev => ({ ...prev, selectedTemplate: parsed.selectedTemplate || "classic" }));
          setAppState(prev => ({ ...prev, isLobby: true }));
        } else {
          localStorage.removeItem(STATE_STORAGE_KEY);
        }
      } catch (err) { }
    }
  }, []);
  const fetchFinalStoryResult = useCallback(async () => {
    if (!sessionId) return;
    try {
      const sheets = await getStorySheetsBySession(sessionId);
      const built = sheets
        .filter(s => s.answers && s.answers.length > 0)
        .map(s => {
          const sorted = [...s.answers!].sort((a, b) => a.position_in_sheet - b.position_in_sheet);
          return {
            playerName: s.player?.nickname || 'Гравець',
            story: activeTemplate.buildStory(sorted.map(a => a.answer_text), language, String(session?.id || sessionId || '0'), String(s.id || Math.random())),
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
    if (!session || session.session_status !== 'active' || isHost || !sessionId || !playerId) return;
    if (myStorySheetId && currentRoundId) return;
    (async () => {
      try {
        const [rounds, sheets] = await Promise.all([
          getRoundsBySession(sessionId),
          getStorySheetsBySession(sessionId),
        ]);
        const activeRound = [...rounds].sort((a: any, b: any) => b.round_number - a.round_number)[0];
        if (activeRound && !currentRoundId) {
          setAppState(prev => ({ ...prev, currentRoundId: activeRound.id }));
          setAppState(prev => ({ ...prev, currentRound: activeRound.round_number }));
          if (activeRound.started_at) setAppState(prev => ({ ...prev, roundStartedAt: activeRound.started_at }));
        }
        if (sheets.length > 0) {
          setAppState(prev => ({ ...prev, allStorySheets: sheets.map((s: any) => ({ playerId: s.player?.id, sheetId: s.id })) }));
        }
        const mySheet = sheets.find((s: any) => s.player?.id === playerId);
        if (mySheet && !myStorySheetId) setAppState(prev => ({ ...prev, myStorySheetId: mySheet.id }));
        if (players.length > 0) setAppState(prev => ({ ...prev, playerCount: players.length }));
      } catch (err) {
      }
    })();
  }, [session?.session_status, isHost, sessionId, playerId, myStorySheetId, currentRoundId]);
  useEffect(() => {
    if (phase !== Phases.Waiting || !session || !currentRoundId || !sessionId) return;
    let localPhase: Phases = phase;
    const interval = setInterval(async () => {
      if (localPhase !== Phases.Waiting || transitionLockRef.current) return;
      try {
        const ans = await getAnswersByRound(currentRoundId);
        setAppState(prev => ({ ...prev, joinedCount: ans.length }));
        const total = playerCount > 0 ? playerCount : players.length;
        setAppState(prev => ({ ...prev, totalCount: total }));
        if (ans.length >= total && total > 0) {
          transitionLockRef.current = true;
          if (currentRound < activeTemplate.questions.length) {
            localPhase = Phases.Main;
            if (isHost) {
              const ts = new Date().toISOString();
              const nextRound = await createRound({
                
                session_id: sessionId,
                round_number: currentRound + 1,
                question_type: activeTemplate.questionTypes[currentRound],
                rounds_status: 'active',
                started_at: ts,
              });
              setAppState(prev => ({ ...prev, currentRoundId: nextRound.id }));
              setAppState(prev => ({ ...prev, roundStartedAt: ts }));
              setAppState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
              transitionLockRef.current = false;
              setAppState(prev => ({ ...prev, phase: Phases.Main }));
            } else {
              const rList = await getRoundsBySession(session.id!);
              const nextRound = rList.find((r: any) => r.round_number === currentRound + 1);
              if (nextRound) {
                setAppState(prev => ({ ...prev, currentRoundId: nextRound.id }));
                if (nextRound.started_at) setAppState(prev => ({ ...prev, roundStartedAt: nextRound.started_at }));
                setAppState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
                transitionLockRef.current = false;
                setAppState(prev => ({ ...prev, phase: Phases.Main }));
              } else {
                localPhase = Phases.Waiting;
                transitionLockRef.current = false;
              }
            }
          } else {
            localPhase = Phases.End;
            if (isHost) {
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
    }, 400);
    return () => clearInterval(interval);
  }, [phase, session?.id, currentRoundId, playerCount, players.length, currentRound, isHost, sessionId, fetchFinalStoryResult]);
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
    setAppState(prev => ({ ...prev, nickname: "" }));
    setAppState(prev => ({ ...prev, roomCode: "" }));
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
    if (value.length <= 10) {
      setAppState(prev => ({ ...prev, nickname: value }));
      setAppState(prev => ({ ...prev, error: "" }));
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
        max_players: 4,
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
      const targetSession = allSessions.find(s => s.session_name === code && s.session_status === 'waiting');
      if (!targetSession) {
        return setAppState(prev => ({ ...prev, error: String(t('ERR_NOT_FOUND' as any)) }));
      }
      setAppState(prev => ({ ...prev, nickname: nick }));
      setAppState(prev => ({ ...prev, roomCode: code }));
      setAppState(prev => ({ ...prev, sessionId: targetSession.id }));
      setAppState(prev => ({ ...prev, isHost: false }));
      
      const guest = await createPlayer({
        
        nickname: nick,
        session_id: targetSession.id,
        players_status: 'joined',
      });
      setAppState(prev => ({ ...prev, playerId: guest.id }));
      setAppState(prev => ({ ...prev, isLobby: true }));
      setAppState(prev => ({ ...prev, didGameStart: false }));
      setAppState(prev => ({ ...prev, isCreatingLobby: false }));
      setAppState(prev => ({ ...prev, phase: Phases.Main }));
      await refreshState();
    } catch (err: any) {
      setAppState(prev => ({ ...prev, error: String(t('ERR_JOIN' as any)) + err.message }));
    }
  };
  const doGameStart = async () => {
    if (!sessionId) return;
    try {
      await updateGameSession(sessionId, { session_status: 'active' });
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
        safeSheets = fetched.map((s: any) => ({ playerId: s.player?.id, sheetId: s.id }));
        if (safeSheets.length > 0) setAppState(prev => ({ ...prev, allStorySheets: safeSheets }));
      }
      let targetSheet = myStorySheetId || safeSheets.find(s => s.playerId === playerId)?.sheetId;
      if (safeSheets.length > 0 && players.length > 0) {
        const sortedPlayers = [...players].sort((a, b) => a.id - b.id);
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
      const curAnswers = await getAnswersByRound(currentRoundId);
      setAppState(prev => ({ ...prev, joinedCount: curAnswers.length }));
      setAppState(prev => ({ ...prev, totalCount: playerCount > 0 ? playerCount : players.length }));
      transitionLockRef.current = false;
      setAppState(prev => ({ ...prev, phase: Phases.Waiting }));
    } catch (err: any) { }
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
      {(phase === Phases.Join || (isCreatingLobby && !isLobby)) && (
        <>
          <div className="yellow-guy-bg" onClick={playSecretMusic} />
          <div className="red-guy-bg" onClick={playSecretMusic} />
        </>
      )}

      {!didGameStart && isCreatingLobby && !isLobby && phase !== Phases.Join && (
        <>
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
                      {i === 0 && <img src={crownImage} alt="Host" className="crown-icon" />}
                      <span className="player-name">{p.nickname}</span>
                    </div>
                  ))
                ) : (
                  <div className="player-item">
                    <img src={crownImage} alt="Host" className="crown-icon" />
                    <span className="player-name">{nickname}</span>
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
          <JoinCard
            onJoin={handleJoinGame}
          />
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}
      {didGameStart && phase === Phases.Waiting && (
        <WaitCard
          nick={nickname}
          joinedCount={joinedCount}
          totalCount={totalCount}
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
            playerReady={1}
            playerTotal={totalCount}
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
