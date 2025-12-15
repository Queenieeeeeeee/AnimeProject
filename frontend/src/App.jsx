// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse'
import Recommendations from './pages/Recommendations';
import Studios from './pages/Studios';
import AnimeDetail from './pages/AnimeDetail';
import BackToTop from './components/BackToTop'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            
            {/* Analytics Routes */}
            <Route path="/analytics/studios" element={<Studios />} />
            <Route path="/analytics/overview" element={<div className="text-center text-2xl mt-20">Overview - Coming Soon</div>} />
            <Route path="/analytics/genres" element={<div className="text-center text-2xl mt-20">Genres - Coming Soon</div>} />
          </Routes>
        </main>
        <BackToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;