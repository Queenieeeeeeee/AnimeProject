// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Discover from './pages/Discover';
import AnimeDetail from './pages/AnimeDetail';
import BackToTop from './components/BackToTop';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-6 w-full">
          <SearchBar />
        </div>
        <main className="container mx-auto px-4 py-8 pt-24 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;