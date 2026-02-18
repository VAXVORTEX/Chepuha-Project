import { useEffect, useState } from "react";
import Button from "./components/Button/Button";
import Story from "./components/Story/Story";
import { RoundCard } from "./components/RoundCard/RoundCard";
import GameCode from "./components/GameCode/GameCode";
import "./App.scss";
import { Phases } from "./types/phaseVariant";
import Round from "./components/Round/Round";
import WaitCard from "./components/WaitCard/WaitCard";
import JoinCard from "./components/JoinCard/JoinCard";
import GameResult from "./components/GameResult/GameResult";

const TIME_DELAY=3500;


function App() {
  const [phase, setPhase] = useState<Phases>(Phases.Main);
  const [didGameStarted, setDidGameStarted] = useState(false);
  const [userNick, setUserNick] = useState("PLAYER 1");
   const [roomCode, setRoomCode] = useState("");
  const [currAnswer, setCurrAnswer] = useState("");

  useEffect(() => {
    if (phase === Phases.Lobby) {
      const timer = setTimeout(() => {
        doGameStart();
      }, TIME_DELAY);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  const goHome = () => {
    setPhase(Phases.Main);
    setDidGameStarted(false);
    setUserNick("");
    setRoomCode("");
  };

  const gotoLobby = () => {
    setPhase(Phases.Lobby);
  };

  const gotoJoin = () => {
    setPhase(Phases.Join);
  };

  const doJoinRound = () => {
    setPhase(Phases.Lobby);
  };

  const doGameStart = () => {
    setDidGameStarted(true);
    setPhase(Phases.Main);
  };

  const doAnswerSubmit = (answer: string) => {
    setCurrAnswer(answer);
    setPhase(Phases.Waiting);
  };

  return (
    <div className="app-view">
      {!didGameStarted && phase === Phases.Main && (
        <>
          <GameCode code="A7B9G6TR" className="gameCodePos" />
          <Button
            label="Створити гру"
            variant="primary"
            phase={phase}
            onClick={gotoJoin}
          />
        </>
      )}

      {!didGameStarted && phase === Phases.Join && (
        <JoinCard nick={userNick} setNick= {setUserNick} roomCode={roomCode} setRoomCode={setRoomCode} onJoin={doJoinRound} onHome={goHome} errors={{}} />
      )}

      {!didGameStarted && phase === Phases.Lobby && (
        <WaitCard
          nick={userNick}
          joinedCount={3}
          totalCount={4}
          onHome={goHome}
          onStartGame={doGameStart}
        />
      )}

      {didGameStarted && phase === Phases.Main && (
        <>
          <Round currentRound={1} totalRounds={8} className="roundPos" />

          <RoundCard
            playerName={userNick}
            phase={phase}
            question="Хто запросив на паті?"
            playerReady={1}
            playerTotal={4}
            onSubmitAnswer={doAnswerSubmit}
          />
        </>
      )}

      {phase == Phases.Waiting && (
        <GameResult
          title="Результат гри"
          content={currAnswer}
          phase={phase}
          onHome={goHome}
          onSave={() => setPhase(Phases.End)}
        />
      )}

      {phase === Phases.End && (
        <Story
          title="Історія гри"
          content={currAnswer}
          phase={phase}
          onHome={goHome}
        />
      )}
    </div>
  );
}

export default App;
