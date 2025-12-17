// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🎬 AnimeDB
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Home
            </Link>
            <Link 
              to="/discover" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Discover
            </Link>
            <Link 
              to="/browse" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Browse
            </Link>
            <Link 
              to="/analytics/overview" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;