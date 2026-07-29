import { BrowserRouter, Routes, Route } from "react-router-dom";
import MagicLinkLogin from "./components/MagicLinkLogin";
function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/login" element={<MagicLinkLogin />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
