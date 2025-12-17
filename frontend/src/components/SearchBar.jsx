// src/components/SearchBar.jsx - 完整多選版本
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenres, getRandomAnime } from '../services/api';
import MultiSelectDropdown from './MultiSelectDropdown';

function SearchBar() {
  const navigate = useNavigate();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced search states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genres: [],
    min_score: '',
    max_score: '',
    years: [], // 改成複數
    types: [], // 改成複數
    sort_by: 'score',
    order: 'desc'
  });
  
  // Random anime state
  const [isGettingRandom, setIsGettingRandom] = useState(false);

  // Type options for MultiSelect
  const typeOptions = [
    { id: 1, name: 'TV' },
    { id: 2, name: 'Movie' },
    { id: 3, name: 'OVA' },
    { id: 4, name: 'ONA' },
    { id: 5, name: 'Special' }
  ];

  // Generate year options (1960 to current year + 1)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1960 + 2 },
    (_, i) => ({ id: i, name: String(currentYear + 1 - i) })
  );

  // Load genres when advanced search is opened
  const handleToggleAdvanced = async () => {
    setShowAdvanced(!showAdvanced);
    if (!showAdvanced && genres.length === 0) {
      try {
        const response = await getGenres();
        setGenres(response.data.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && filters.genres.length === 0 && filters.years.length === 0 && filters.types.length === 0) return;

    // 建立 URL 查詢參數
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.append('q', searchQuery);
    
    // 處理多個 genres - 用逗號分隔
    if (filters.genres.length > 0) {
      params.append('genres', filters.genres.join(','));
    }
    
    if (filters.min_score) params.append('min_score', filters.min_score);
    if (filters.max_score) params.append('max_score', filters.max_score);
    
    // 處理多個 years
    if (filters.years.length > 0) {
      params.append('years', filters.years.join(','));
    }
    
    // 處理多個 types
    if (filters.types.length > 0) {
      params.append('types', filters.types.join(','));
    }
    
    params.append('sort_by', filters.sort_by);
    params.append('order', filters.order);

    // 導航到 Browse 頁面並帶上搜尋參數
    navigate(`/browse?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      genres: [],
      min_score: '',
      max_score: '',
      years: [],
      types: [],
      sort_by: 'score',
      order: 'desc'
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Remove individual filter
  const removeFilter = (field) => {
    if (field === 'searchQuery') {
      setSearchQuery('');
    } else if (field === 'genres' || field === 'types' || field === 'years') {
      handleFilterChange(field, []);
    } else {
      handleFilterChange(field, '');
    }
  };

  const handleRandomPick = async () => {
    setIsGettingRandom(true);
    try {
      const response = await getRandomAnime();
      const animeId = response.data.data.id;
      navigate(`/anime/${animeId}`);
    } catch (error) {
      console.error('Error getting random anime:', error);
    } finally {
      setIsGettingRandom(false);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filters.genres.length > 0 || filters.min_score || 
                          filters.max_score || filters.years.length > 0 || filters.types.length > 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">
          Discover Your Next Favorite Anime
        </h2>

        <form onSubmit={handleSearch}>
          {/* Basic Search Bar */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime by title..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Search
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Advanced Search Toggle */}
            <button
              type="button"
              onClick={handleToggleAdvanced}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition backdrop-blur-sm border border-white/30"
            >
              Advanced {showAdvanced ? '▲' : '▼'}
            </button>

            {/* Random Pick Button */}
            <button
              type="button"
              onClick={handleRandomPick}
              disabled={isGettingRandom}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition disabled:opacity-50 backdrop-blur-sm border border-white/30"
            >
              <span className="text-lg">🎲</span>
              <span className="text-sm font-medium">
                {isGettingRandom ? 'Finding...' : "Random Pick"}
              </span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition backdrop-blur-sm border border-white/30"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium opacity-90">Active Filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('searchQuery')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove search query"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.genres.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Genres ({filters.genres.length}): {filters.genres.join(', ')}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('genres')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove genre filters"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.types.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Types ({filters.types.length}): {filters.types.join(', ')}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('types')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove type filters"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.years.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Years ({filters.years.length}): {filters.years.join(', ')}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('years')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove year filters"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.min_score && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Min Score: {filters.min_score}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('min_score')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove min score filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.max_score && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>Max Score: {filters.max_score}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter('max_score')}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Remove max score filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Show Sort/Order only if they're not default values */}
              {(filters.sort_by !== 'score' || filters.order !== 'desc') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
                  <span>
                    Sort: {filters.sort_by === 'score' ? 'Score' : 
                           filters.sort_by === 'members' ? 'Popularity' : 
                           filters.sort_by === 'year' ? 'Year' : 'Title'}
                    {' '}{filters.order === 'desc' ? '↓' : '↑'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleFilterChange('sort_by', 'score');
                      handleFilterChange('order', 'desc');
                    }}
                    className="hover:text-red-300 font-bold text-base leading-none"
                    title="Reset to default sort"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Multi-Select Genre Dropdown */}
                <div className="lg:col-span-2">
                  <MultiSelectDropdown
                    options={genres}
                    selected={filters.genres}
                    onChange={(selected) => handleFilterChange('genres', selected)}
                    placeholder="Select genres..."
                    label="Genres"
                  />
                </div>

                {/* Multi-Select Type Dropdown */}
                <div>
                  <MultiSelectDropdown
                    options={typeOptions}
                    selected={filters.types}
                    onChange={(selected) => handleFilterChange('types', selected)}
                    placeholder="Select types..."
                    label="Type"
                  />
                </div>

                {/* Multi-Select Year Dropdown */}
                <div>
                  <MultiSelectDropdown
                    options={yearOptions}
                    selected={filters.years}
                    onChange={(selected) => handleFilterChange('years', selected)}
                    placeholder="Select years..."
                    label="Year"
                  />
                </div>

                {/* Min Score */}
                <div>
                  <label className="block text-sm font-medium mb-1">Min Score</label>
                  <input
                    type="number"
                    value={filters.min_score}
                    onChange={(e) => handleFilterChange('min_score', e.target.value)}
                    placeholder="0-10"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* Max Score */}
                <div>
                  <label className="block text-sm font-medium mb-1">Max Score</label>
                  <input
                    type="number"
                    value={filters.max_score}
                    onChange={(e) => handleFilterChange('max_score', e.target.value)}
                    placeholder="0-10"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="score">Score</option>
                    <option value="members">Popularity</option>
                    <option value="year">Year</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <select
                    value={filters.order}
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SearchBar;