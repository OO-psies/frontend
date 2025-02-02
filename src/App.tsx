import { useState } from 'react'
import { Button } from "@/components/ui/button"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      </div>
      <h1>OOpSies</h1>
      <h2>Photo Generator</h2>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
