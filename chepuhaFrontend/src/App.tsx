import { useState } from "react";
import Button from "./components/Button/Button";
import Story from "./components/Story/Story";
import { RoundCard } from "./components/RoundCard/RoundCard";
import GameCode from "./components/GameCode/GameCode";
import "./App.scss";
import { Phases } from "./types/phaseVariant";
import Round from "./components/Round/Round";

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
  const [error, setError] = useState("");

  const goHome = () => {
    setPhase(Phases.Main);
    setDidGameStart(false);
    setIsCreatingLobby(false);
    setIsLobby(false);
    setNickname("");
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

    const doJoinGame = () => {
    
  };

  const doShowHistory = () => {
    setPhase(Phases.End);
  };

  const doAnswerSubmit = (answer: string) => {
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
              onClick={doJoinGame}
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

      {!didGameStart && isCreatingLobby && !isLobby && (
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

      {!didGameStart && isLobby && (
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

      {didGameStart && (phase === Phases.Main || phase === Phases.Waiting) && (
        <>
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
        <Story
          title="Історія гри"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          phase={phase}
          onHome={goHome}
          onGoBack={goHome}
        />
      )}
    </div>
  );
}

export default App;
