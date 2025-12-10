// src/pages/Browse.jsx
import { useState, useEffect } from 'react';
import { getAnimeList, searchAnime } from '../services/api';
import { Link } from 'react-router-dom';

function Browse() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(24);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAnime();
  }, [offset]);

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const response = await getAnimeList(limit, offset);
      setAnimeList(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAnime();
      return;
    }

    setLoading(true);
    try {
      const response = await searchAnime(searchQuery, limit, offset);
      setAnimeList(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setOffset(prev => prev + limit);
    window.scrollTo(0, 0);
  };

  const handlePrevPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
    window.scrollTo(0, 0);
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse Anime</h1>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime by title..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOffset(0);
                fetchAnime();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-gray-600">
        Showing {offset + 1} - {Math.min(offset + limit, total)} of {total.toLocaleString()} anime
        {searchQuery && ` (filtered by "${searchQuery}")`}
      </div>

      {/* Anime Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-xl">Loading anime...</div>
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-xl text-gray-600">No anime found</div>
          <p className="text-gray-500 mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
            {animeList.map(anime => (
            <Link 
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer"
            >
                <img
                src={anime.image_url}
                alt={anime.title}
                className="w-48 h-72 object-cover"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/225x350?text=No+Image';
                }}
                />
                <div className="p-3">
                <h3 
                    className="font-semibold text-sm line-clamp-2 mb-2" 
                    title={anime.title}
                >
                    {anime.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                    ⭐ {anime.score || 'N/A'}
                    </span>
                    <span className="text-xs">{anime.type}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {anime.year || 'Unknown'}
                    {anime.episodes && ` • ${anime.episodes} eps`}
                </div>
                </div>
            </Link>
            ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && animeList.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button
            onClick={handlePrevPage}
            disabled={offset === 0}
            className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={offset + limit >= total}
            className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Browse;