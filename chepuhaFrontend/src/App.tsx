import { useState } from "react";
import Button from "./components/Button/Button";
import Story from "./components/Story/Story";
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
import homeImage from "./assets/images/house.png";
import crownImage from "./assets/images/crown.png";

const HomeIcon = ({ onClick, className }: { onClick: () => void, className?: string }) => (
  <div className={className} onClick={onClick}>
  <img
    src={homeImage}
    alt="Home"
  />
  </div>
);

function App() {
  const [phase, setPhase] = useState<Phases>(Phases.Main);
  const [didGameStart, setDidGameStart] = useState(false);
  
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const [isLobby, setIsLobby] = useState(false);

  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [savedStories, setSavedStories] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");

  const [joinedCount, setJoinedCount] = useState(1);
  const [totalCount, setTotalCount] = useState(4);

  const goHome = () => {
    setPhase(Phases.Main);
    setDidGameStart(false);
    setIsCreatingLobby(false);
    setIsLobby(false);
    setNickname("");
    setRoomCode("");
    setError("");
  };

  const doShowCreateScreen = () => {
    setIsCreatingLobby(true);
    setIsLobby(false);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setNickname(value);
      setError("");
    }
  };

  const goToLobby = () => {
    if (!nickname.trim()) {
      setError("Введіть нікнейм");
      return;
    }
    setIsLobby(true);
  };

  const doGameStart = () => {
    setDidGameStart(true);
    setPhase(Phases.Main);
  };

  const doShowJoinScreen = () => {
    setPhase(Phases.Join); 
    setDidGameStart(false);
    setIsCreatingLobby(false);
  };

  const handleJoinGame = (nick: string, code: string) => {
    setNickname(nick);
    setRoomCode(code);
    setPhase(Phases.Waiting); 
    setDidGameStart(false); 
    setTimeout(() => {
      setDidGameStart(true);
      setPhase(Phases.Main);
    }, 3000);
  };

  const doShowHistory = () => {
    setPhase(Phases.History);
  };

  const doAnswerSubmit = (answer: string) => {
    if (answer === "Час вийшов" || answer.trim() === "") {
      setCurrentResult(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      );
    } else {
      setCurrentResult(answer);
    }
    setPhase(Phases.Waiting);
    setTimeout(() => {
      setPhase(Phases.End);
    }, 3500);
  };

return (
    <div className="app-view">
      {!didGameStart && !isCreatingLobby && phase === Phases.Main && (
        <>
          <img src={logoImage} alt="Чепуха Лого" className="logo" />
          <div className="menu-buttons">
            <Button
              label="СТВОРИТИ ГРУ"
              variant="primary"
              phase={phase}
              onClick={doShowCreateScreen}
            />
            <Button
              label="ПРИЄДНАТИСЯ ДО ГРИ"
              variant="primary"
              phase={phase}
              onClick={doShowJoinScreen}
            />
            <Button
              label="ІСТОРІЯ ІГОР"
              variant="primary"
              phase={phase}
              onClick={doShowHistory}
            />
          </div>
        </>
      )}

      {!didGameStart && isCreatingLobby && !isLobby && phase !== Phases.Join && (
        <>
          <GameCode code="A7B9G6TR" className="gameCodePos" />
          <div className="create-game-container">
            <div className="input-wrapper">
              <input
                type="text"
                className={`nickname-input ${error ? "error" : ""}`}
                placeholder="Введіть ваш нік..."
                value={nickname}
                onChange={handleNicknameChange}
              />
            </div>

            {error && <span className="error-message">{error}</span>}

            <Button
              label="СТВОРИТИ ГРУ"
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
          <GameCode code="A7B9G6TR" className="gameCodePos" />

          <div className="lobby-container">
            <div className="lobby-info">
              <h2 className="lobby-text">ВАШ НІК: {nickname}</h2>
              <h3 className="lobby-subtitle">СПИСОК ГРАВЦІВ:</h3>
              <div className="players-list">
                <div className="player-item">
                  <img src={crownImage} alt="Host" className="crown-icon" />
                  <span className="player-name">{nickname}</span>
                </div>
              </div>
            </div>
            <div className="lobby-actions">
              <Button label="ПОЧАТИ ГРУ" variant="primary" phase={phase} onClick={doGameStart} />
            </div>
          </div>
          <HomeIcon className="homeIconPos" onClick={goHome} />
        </>
      )}

      {phase === Phases.Join && (
        <JoinCard 
          onJoin={handleJoinGame} 
          onHome={goHome} 
        />
      )}

      {!didGameStart && phase === Phases.Waiting && (
        <WaitCard 
          nick={nickname}
          joinedCount={joinedCount}
          totalCount={totalCount}
        />
      )}

      {didGameStart && (phase === Phases.Main || phase === Phases.Waiting) && (
        <>
          {phase === Phases.Main && ( 
            <Timer 
              initialSeconds={120} 
              onTimeUp={() => doAnswerSubmit("Час вийшов")} 
              className="timerPos" 
            />
          )}
          <Round currentRound={1} totalRounds={8} className="roundPos" />
          <RoundCard
            playerName={nickname}
            phase={phase}
            question="Хто запросив на паті?"
            playerReady={1}
            playerTotal={4}
            onSubmitAnswer={doAnswerSubmit}
          />
        </>
      )}

      {phase === Phases.End && (
        <GameResult 
          title="Результат гри"
          content={currentResult}
          phase={phase}
          onHome={goHome}
          onSave={() => {
            setSavedStories([currentResult]); 
            goHome();
          }}
          
        />
      )}

      {phase === Phases.History && (
        <Story
          title="Історія ігор"
          content={savedStories.length > 0 ? savedStories.join("\n\n---\n\n") : "У вас поки немає збережених історій."}
          phase={phase}
          onHome={goHome}
        />
      )}
    </div>
  );
}

export default App;
