import { useState } from 'react'
import Button from './components/Button/Button'
import './App.scss'


function App(){
  const [phase, setPhase] = useState<'main' | 'waiting' | 'end'> ('main');

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems:'center',
        height: '100vh'
    }}>

{
    phase === 'main' && (
        <Button label='Створити гру' variant="primary" phase={phase} onClick={() => setPhase('waiting')}/>
)}

{phase === 'waiting' && (
        <Button label='Зберегти' variant="secondary" phase={phase} onClick={() => setPhase('end')}/>
)}

{phase === 'end' && (
        <Button label='Повернутись' variant="primary" phase={phase} onClick={() => setPhase('main')}/>
)}
</div>
  )
}
export default App