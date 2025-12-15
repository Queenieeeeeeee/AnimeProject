// src/pages/Recommendations.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAnime, getRecommendations } from '../services/api';

function Recommendations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const response = await searchAnime(searchQuery, 10);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Failed to search anime. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    setSearchResults([]);
    setSearchQuery('');
    setRecommendations([]); // Clear previous recommendations
    setError(null);
  };

  const handleGetRecommendations = async () => {
    if (!selectedAnime) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the real recommendation API
      const response = await getRecommendations(selectedAnime.id, 10);
      
      if (response.success && response.recommendations) {
        setRecommendations(response.recommendations);
      } else {
        setError('No recommendations found. Please try another anime.');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimeClick = (animeId) => {
    navigate(`/anime/${animeId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Anime Recommendations</h1>
      
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">Find Your Next Favorite Anime</h2>
        <p className="text-purple-100">
          Tell us what you like, and we'll recommend similar anime based on genres, ratings, studios, and more
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">
          Step 1: Search for an anime you like
        </h3>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Attack on Titan, Naruto, Death Note..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Select an anime:</p>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {searchResults.map(anime => (
                <button
                  key={anime.id}
                  onClick={() => handleSelectAnime(anime)}
                  className="flex gap-4 p-3 border rounded-lg hover:bg-purple-50 transition text-left"
                >
                  <img
                    src={anime.image_url}
                    alt={anime.title}
                    className="w-16 h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x96?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{anime.title}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {anime.year} • {anime.type}
                      {anime.score && ` • ⭐ ${anime.score}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Anime */}
      {selectedAnime && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">
            Step 2: Selected Anime
          </h3>
          
          <div className="flex gap-4 p-4 bg-purple-50 rounded-lg mb-4">
            <img
              src={selectedAnime.image_url}
              alt={selectedAnime.title}
              className="w-20 h-28 object-cover rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x112?text=No+Image';
              }}
            />
            <div className="flex-1">
              <h4 className="font-bold text-lg">{selectedAnime.title}</h4>
              {selectedAnime.title_english && selectedAnime.title_english !== selectedAnime.title && (
                <p className="text-gray-600">{selectedAnime.title_english}</p>
              )}
              <div className="flex gap-3 mt-2 text-sm text-gray-600">
                <span>{selectedAnime.year}</span>
                <span>{selectedAnime.type}</span>
                {selectedAnime.score && <span>⭐ {selectedAnime.score}</span>}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedAnime(null);
                setRecommendations([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
          >
            {isGenerating ? 'Generating Recommendations...' : '🎯 Get Recommendations'}
          </button>
        </div>
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">
            📊 Recommended Anime ({recommendations.length})
          </h3>

          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleAnimeClick(rec.id)}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={rec.image_url}
                    alt={rec.title}
                    className="w-20 h-28 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x112?text=No+Image';
                    }}
                  />
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">
                          #{index + 1} {rec.title}
                        </h4>
                        {rec.title_english && rec.title_english !== rec.title && (
                          <p className="text-sm text-gray-600">{rec.title_english}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(rec.similarity_score * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">Match</div>
                      </div>
                    </div>
                    
                    {/* Anime Info */}
                    <div className="flex gap-3 text-sm text-gray-600 mb-3">
                      <span>{rec.year}</span>
                      <span>{rec.type}</span>
                      {rec.score && <span>⭐ {rec.score}</span>}
                    </div>
                    
                    {/* Genres */}
                    {rec.genres && rec.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {rec.genres.map((genre) => (
                          <span 
                            key={genre.id}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Match Details */}
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Match Breakdown:</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Genre:</span>
                          <span className="ml-1 font-semibold">{Math.round(rec.match_details.genre * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Score:</span>
                          <span className="ml-1 font-semibold">{Math.round(rec.match_details.score * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Demo:</span>
                          <span className="ml-1 font-semibold">{Math.round(rec.match_details.demographic * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Studio:</span>
                          <span className="ml-1 font-semibold">{Math.round(rec.match_details.studio * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Year:</span>
                          <span className="ml-1 font-semibold">{Math.round(rec.match_details.year * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      {!selectedAnime && !recommendations.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Search for an anime you enjoyed</li>
            <li>Select it from the results</li>
            <li>Click "Get Recommendations" to see similar anime</li>
            <li>Our algorithm finds anime with similar characteristics:</li>
          </ol>
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-blue-700">
            <li>Matching genres and themes (50%)</li>
            <li>Similar ratings and quality (25%)</li>
            <li>Target demographic (10%)</li>
            <li>Same studios or producers (10%)</li>
            <li>Related release periods (5%)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Recommendations;