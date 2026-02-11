import { useState } from "react";
import Button from "./components/Button/Button";
import Story from "./components/Story/Story";
import { RoundCard } from "./components/RoundCard/RoundCard";
import GameCode from "./components/GameCode/GameCode";
import "./App.scss";
import { Phases } from "./types/phaseVariant";
import Round from "./components/Round/Round";

import logoImage from "./assets/images/Logo.png";

function App() {
  const [phase, setPhase] = useState<Phases>(Phases.Main);
  const [didGameStart, setDidGameStart] = useState(false);

  const goHome = () => {
    setPhase(Phases.Main);
    setDidGameStart(false);
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
      {!didGameStart && phase === Phases.Main && (
        <>
          <img src={logoImage} alt="Чепуха Лого" className="logo" />
          <div className="menu-buttons">
            <Button
              label="СТВОРИТИ ГРУ"
              variant="primary"
              phase={phase}
              onClick={doGameStart}
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

      {didGameStart && (phase === Phases.Main || phase === Phases.Waiting) && (
        <>
          <Round
            currentRound={1}
            totalRounds={8}
            className="roundPos"
          />
          <RoundCard
            playerName="PLAYER 1"
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
          content=" Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          phase={phase}
          onHome={goHome}
          onGoBack={goHome}
        />
      )}
    </div>
  );
}

export default App;
