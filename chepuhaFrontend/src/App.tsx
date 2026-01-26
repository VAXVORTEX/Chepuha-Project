import { useState } from 'react';
import Button from './components/Button/Button';
import './App.scss';
import { Phases } from './types/phaseVariant';
import { RoundCard } from './components/RoundCard/RoundCard';

function App() {
  const [phase, setPhase] = useState<Phases>(Phases.Main);

  return (
    <div className='app-view'>

      <RoundCard 
         playerName="PLAYER 1"
         phase={phase}
         question="Хто запросив на паті?"
         playerReady={1}
         playerTotal={4}
         onSubmitAnswer={() => setPhase(Phases.Waiting)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        
        <Button 
            label='Створити гру' 
            variant="primary" 
            phase={Phases.Main} 
            onClick={() => {}} 
        />

        <Button 
            label='Зберегти' 
            variant="secondary" 
            phase={Phases.Waiting} 
            onClick={() => {}} 
        />

        <Button 
            label='Повернутись' 
            variant="primary" 
            phase={Phases.End} 
            onClick={() => {}} 
        />
      </div>

    </div>
  );
}

export default App;