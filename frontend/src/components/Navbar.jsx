// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold hover:text-blue-200 transition">
            🎌 Anime Analytics
          </Link>
          <div className="flex gap-10 items-center">
            <Link to="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link to="/browse" className="hover:text-blue-200 transition">
              Browse
            </Link>
            <Link to="/recommendations" className="hover:text-blue-200 transition">
              Recommendations
            </Link>
            
            {/* Analytics Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAnalyticsOpen(!analyticsOpen)}
                className="hover:text-blue-200 transition flex items-center gap-1"
              >
                Analytics
                <span className={`transform transition-transform ${analyticsOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {analyticsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/analytics/overview"
                    className="block px-4 py-2 hover:bg-blue-50 transition"
                    onClick={() => setAnalyticsOpen(false)}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/analytics/genres"
                    className="block px-4 py-2 hover:bg-blue-50 transition"
                    onClick={() => setAnalyticsOpen(false)}
                  >
                    Genres
                  </Link>
                  <Link
                    to="/analytics/studios"
                    className="block px-4 py-2 hover:bg-blue-50 transition"
                    onClick={() => setAnalyticsOpen(false)}
                  >
                    Studios
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {analyticsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAnalyticsOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;