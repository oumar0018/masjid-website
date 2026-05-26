import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MasjidApp from "./MasjidApp";
import Admin from "./admin";
import VideoGallery from './components/Videos';
// Inside your <Routes> component, add:


function App() {
  return (
    <Router>
      <Routes>
        {/* Public page */}
        <Route path="/" element={<MasjidApp />} />

        {/* Video gallery */}
        <Route path="/videos" element={<VideoGallery />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
