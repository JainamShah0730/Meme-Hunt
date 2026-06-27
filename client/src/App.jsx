import { BrowserRouter, Routes, Route } from "react-router-dom"
import Search from "./pages/Search"
import Editor from "./pages/Editor"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App