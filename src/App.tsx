import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>My Photo App</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Photo organizer app with React, TypeScript, and Vite
          </p>
        </div>
      </div>
    </>
  )
}

export default App