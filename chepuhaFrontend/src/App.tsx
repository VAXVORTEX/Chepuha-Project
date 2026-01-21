import { useState } from 'react'
import Button from './components/Button/Button'
import './App.scss'
import { Phases } from './types/phasevariant'


function App(){
  const [phase, setPhase] = useState<Phases>(Phases.Main);

  return (
    <div className='app-view'>

{
    phase === Phases.Main && (
        <Button label='Створити гру' variant="primary" phase={phase} onClick={() => setPhase(Phases.Waiting)}/>
)}

{phase === Phases.Waiting && (
        <Button label='Зберегти' variant="secondary" phase={phase} onClick={() => setPhase(Phases.End)}/>
)}

{phase === Phases.End && (
        <Button label='Повернутись' variant="primary" phase={phase} onClick={() => setPhase(Phases.Main)}/>
)}
</div>
  )
}
export default App