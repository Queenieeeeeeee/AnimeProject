import { useState, useEffect } from 'react';
import { getAnimeList, searchAnime, getGenres } from '../services/api';
import AnimeCard from '../components/AnimeCard';

function Browse() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    min_score: '',
    max_score: '',
    year: '',
    type: '',
    sort_by: 'score',
    order: 'desc'
  });
  
  // Pagination
  const [limit] = useState(24);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  // Load genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch anime when offset or filters change
  useEffect(() => {
    fetchAnime();
  }, [offset]);

  const fetchGenres = async () => {
    try {
      const response = await getGenres();
      setGenres(response.data.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

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
    setOffset(0); // Reset to first page
    
    setLoading(true);
    try {
      // Build params object
      const params = {
        limit,
        offset: 0,
        ...(searchQuery.trim() && { q: searchQuery }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.min_score && { min_score: parseFloat(filters.min_score) }),
        ...(filters.max_score && { max_score: parseFloat(filters.max_score) }),
        ...(filters.year && { year: parseInt(filters.year) }),
        ...(filters.type && { type: filters.type }),
        sort_by: filters.sort_by,
        order: filters.order
      };
      
      const response = await searchAnime(params);
      setAnimeList(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      genre: '',
      min_score: '',
      max_score: '',
      year: '',
      type: '',
      sort_by: 'score',
      order: 'desc'
    });
    setOffset(0);
    fetchAnime();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filters.genre || filters.min_score || 
                          filters.max_score || filters.year || filters.type;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse Anime</h1>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch}>
          {/* Basic Search */}
          <div className="flex gap-4 mb-4">
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
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Advanced {showAdvanced ? '▲' : '▼'}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.name}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                    <option value="Special">Special</option>
                    <option value="Music">Music</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    placeholder="e.g., 2024"
                    min="1960"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="score">Score</option>
                    <option value="members">Popularity</option>
                    <option value="year">Year</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                {/* Min Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Score
                  </label>
                  <input
                    type="number"
                    value={filters.min_score}
                    onChange={(e) => handleFilterChange('min_score', e.target.value)}
                    placeholder="0.0"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={filters.max_score}
                    onChange={(e) => handleFilterChange('max_score', e.target.value)}
                    placeholder="10.0"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    value={filters.order}
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-gray-600">
        Showing {offset + 1} - {Math.min(offset + limit, total)} of {total.toLocaleString()} anime
        {hasActiveFilters && ' (filtered)'}
      </div>

      {/* Anime Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-xl">Loading anime...</div>
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-xl text-gray-600">No anime found</div>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          {animeList.map(anime => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              variant="grid"
              showYear={false}
              showEpisodes={true}
            />
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