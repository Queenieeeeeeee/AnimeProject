// src/pages/Browse.jsx - Fixed version (no duplicate useEffect)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAnimeList, searchAnime } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import FilterTags from '../components/FilterTags';

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [limit] = useState(24);
  
  // Search and filter states - synced with URL
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    genres: [],
    min_score: '',
    max_score: '',
    years: [],
    types: [],
    sort_by: 'score',
    order: 'desc'
  });

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setFilters({
      genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
      min_score: searchParams.get('min_score') || '',
      max_score: searchParams.get('max_score') || '',
      years: searchParams.get('years')?.split(',').filter(Boolean) || [],
      types: searchParams.get('types')?.split(',').filter(Boolean) || [],
      sort_by: searchParams.get('sort_by') || 'score',
      order: searchParams.get('order') || 'desc'
    });
  }, [searchParams]);

  // Auto-close advanced search when there are no search params (after clear)
  useEffect(() => {
    const hasSearchParams = Array.from(searchParams.keys()).some(key => key !== 'page');
    if (!hasSearchParams && showAdvanced) {
      setShowAdvanced(false);
    }
  }, [searchParams]);

  // ✅ FIXED: Single useEffect for fetching data
  useEffect(() => {
    const hasSearchParams = Array.from(searchParams.keys()).some(key => key !== 'page');
    if (hasSearchParams) {
      performSearch();
    } else {
      fetchAnime();
    }
  }, [searchParams]); // This will trigger whenever URL params change

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await getAnimeList(limit, offset);
      setAnimeList(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const params = {
        limit,
        offset,
        ...(searchParams.get('q') && { q: searchParams.get('q') }),
        ...(searchParams.get('genres') && { genres: searchParams.get('genres') }),
        ...(searchParams.get('min_score') && { min_score: parseFloat(searchParams.get('min_score')) }),
        ...(searchParams.get('max_score') && { max_score: parseFloat(searchParams.get('max_score')) }),
        ...(searchParams.get('years') && { years: searchParams.get('years') }),
        ...(searchParams.get('types') && { types: searchParams.get('types') }),
        sort_by: searchParams.get('sort_by') || 'score',
        order: searchParams.get('order') || 'desc'
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

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Reset to first page
    params.append('page', '1');
    
    if (searchQuery.trim()) params.append('q', searchQuery);
    if (filters.genres.length > 0) params.append('genres', filters.genres.join(','));
    if (filters.min_score) params.append('min_score', filters.min_score);
    if (filters.max_score) params.append('max_score', filters.max_score);
    if (filters.years.length > 0) params.append('years', filters.years.join(','));
    if (filters.types.length > 0) params.append('types', filters.types.join(','));
    params.append('sort_by', filters.sort_by);
    params.append('order', filters.order);
    
    setSearchParams(params);
  };

  const handleClear = () => {
    // Reset all search states
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
    
    // Close advanced search
    setShowAdvanced(false);
    
    // Clear URL params and reset to page 1
    setSearchParams({});
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveFilter = (field) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (field === 'searchQuery') {
      newParams.delete('q');
    } else if (field === 'sort') {
      newParams.set('sort_by', 'score');
      newParams.set('order', 'desc');
    } else if (field === 'genres' || field === 'types' || field === 'years') {
      newParams.delete(field);
    } else {
      newParams.delete(field);
    }
    
    // Reset to first page
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);
  const isSearchMode = Array.from(searchParams.keys()).some(key => key !== 'page');
  const offset = (currentPage - 1) * limit;

  const currentFilters = {
    searchQuery: searchParams.get('q') || '',
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    types: searchParams.get('types')?.split(',').filter(Boolean) || [],
    years: searchParams.get('years')?.split(',').filter(Boolean) || [],
    min_score: searchParams.get('min_score') || '',
    max_score: searchParams.get('max_score') || '',
    sort_by: searchParams.get('sort_by') || 'score',
    order: searchParams.get('order') || 'desc',
  };

  return (
    <div>
      {/* Filter Tags Display */}
      {isSearchMode && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 mb-6">
          <FilterTags
            filters={currentFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClear}
          />
        </div>
      )}

      {/* Results Info */}
      <div className="mb-4 text-gray-600">
        Showing {offset + 1} - {Math.min(offset + limit, total)} of {total.toLocaleString()} anime
        {isSearchMode && ' (search results)'}
      </div>

      {/* Anime Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading anime...</div>
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-xl text-gray-600 mb-2">No anime found</div>
          <p className="text-gray-500">Try adjusting your search or filters</p>
          {isSearchMode && (
            <button
              onClick={handleClear}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Search
            </button>
          )}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 mb-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              px-4 py-2 rounded-lg font-medium transition
              ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {totalPages <= 20 ? (
              <>
                <span className="text-gray-600">Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-purple-600 bg-white cursor-pointer"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <option key={pageNum} value={pageNum}>
                      {pageNum}
                    </option>
                  ))}
                </select>
                <span className="text-gray-600">
                  of <span className="font-semibold">{totalPages}</span>
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-600">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      handlePageChange(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-purple-600"
                />
                <span className="text-gray-600">
                  of <span className="font-semibold">{totalPages}</span>
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              px-4 py-2 rounded-lg font-medium transition
              ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Browse;