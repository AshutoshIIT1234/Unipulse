import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import Chatbot from "./pages/Chatbot";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </HashRouter>
  );
}