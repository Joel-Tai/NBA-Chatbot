import "./App.css";
import Layout from "./components/layout/layout.tsx";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import { Data } from "./pages/data";
import { About } from "./pages/about";

import { Results } from "./pages/ask/results.tsx";
import RateLimit from "./pages/rateLimit.tsx";
import Contact from "./pages/contact";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/data" element={<Data />} />
            <Route path="/about" element={<About />} />
            <Route path="/results" element={<Results />} />
            <Route path="/rateLimit" element={<RateLimit />} />
            <Route path="/Contact" element={<Contact />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
