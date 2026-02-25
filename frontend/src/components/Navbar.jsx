// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Anime Compass"
              className="h-16 w-16"
            />
            <span className="text-3xl font-bold text-blue-800">Anime Compass</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Home
            </Link>
            <Link to="/discover" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Discover
            </Link>
            <Link to="/browse" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Browse
            </Link>
            <Link to="/analytics" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Analytics
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;