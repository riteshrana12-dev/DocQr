import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Access from "./pages/Access";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/access/:id" element={<Access />} />
    </Routes>
  );
}

export default App;
