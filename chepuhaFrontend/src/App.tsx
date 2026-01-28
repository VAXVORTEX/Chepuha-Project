import { useState} from 'react'
import Button from './components/Button/Button'
import Story from './components/Story/Story'
import './App.scss'
import { Phases} from './types/phasevariant'

function App(){
    const [phase, setPhase] = useState<Phases>(Phases.Main);
    const goHome = () => setPhase(Phases.Main);

    return(
        <div className='app-view'>


            {phase === Phases.Main && (
            <Button label='Створити гру' variant="primary" phase={phase} onClick={() => setPhase(Phases.Waiting)}/>
            )}


            {phase === Phases.Waiting && (
            <Story title='Історія гри' content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem" phase={phase} onHome={goHome} onGoBack={() => setPhase(Phases.Main)}/>
            )}



            {phase === Phases.End && (
            <Story title='Кінець гри' content="Кінець гри! Дякуємо, що грали з нами!" phase={phase} onHome={goHome} onGoBack={() => setPhase(Phases.Main)}/>
            )}

        </div>
    )
}
export default App;