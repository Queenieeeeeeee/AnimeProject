// src/components/Footer.jsx
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-blue-600">
        
        {/* Left: Brand */}
        <span className="font-semibold">
          Anime Compass
        </span>

        {/* Center: Data source */}
        <span className="text-gray-500 text-xs text-center">
          Data sourced from{' '}
          <a
            href="https://myanimelist.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
          >
            MyAnimeList
          </a>
          {' '}via{' '}
          <a
            href="https://jikan.moe/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
          >
            Jikan API
          </a>
        </span>

        {/* Right: Copyright */}
        <span className="text-gray-400 text-xs">
          © {new Date().getFullYear()} Anime Compass
        </span>

      </div>
    </footer>
  );
}

export default Footer;