import { useEffect, useState } from "react";
import Button from "./components/Button/Button";
import Story from "./components/Story/Story";
import { RoundCard } from "./components/RoundCard/RoundCard";
import GameCode from "./components/GameCode/GameCode";
import "./App.scss";
import { Phases } from "./types/phasevariant";
import Round from "./components/Round/Round";
import WaitCard from "./components/WaitCard/WaitCard";
import JoinCard from "./components/JoinCard/JoinCard";
import GameResult from "./components/GameResult/GameResult";

function App() {
  const [phase, setPhase] = useState<Phases>(Phases.Main);
  const [didGameStarted, setDidGameStarted] = useState(false);
  const [userNick, setUserNick] = useState("");
  const [currAnswer, setCurrAnswer] = useState("");

  useEffect(() => {
    if (phase === Phases.Lobby) {
      const timer = setTimeout(() => {
        doGameStart();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  const goHome = () => {
    setPhase(Phases.Main);
    setDidGameStarted(false);
  };

  const gotoLobby = () => {
    setPhase(Phases.Lobby);
  };

  const gotoJoin = () => {
    setPhase(Phases.Join);
  };

  const doJoinRound = (nick: string, roomCode: string) => {
    console.log(`Приєднання: ${nick}, Кімната: ${roomCode}`);
    setUserNick(nick);
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
        <JoinCard onJoin={doJoinRound} onHome={goHome} errors={{}} />
      )}

      {!didGameStarted && phase === Phases.Lobby && (
        <WaitCard
          nick={userNick || "PLAYER 1"}
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
            playerName={userNick || "PLAYER 1"}
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
          onGoBack={goHome}
          onSave={() => setPhase(Phases.End)}
        />
      )}

      {phase === Phases.End && (
        <Story
          title="Історія гри"
          content={currAnswer}
          phase={phase}
          onHome={goHome}
          onGoBack={goHome}
        />
      )}
    </div>
  );
}

export default App;
