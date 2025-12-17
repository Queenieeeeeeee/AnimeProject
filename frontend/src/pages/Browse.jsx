// src/pages/Browse.jsx - 支援多選版本
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAnimeList, searchAnime, getGenres } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import FilterTags from '../components/FilterTags';

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  
  // Search and filter states - 從 URL 初始化
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    min_score: searchParams.get('min_score') || '',
    max_score: searchParams.get('max_score') || '',
    years: searchParams.get('years')?.split(',').filter(Boolean) || [],
    types: searchParams.get('types')?.split(',').filter(Boolean) || [],
    sort_by: searchParams.get('sort_by') || 'score',
    order: searchParams.get('order') || 'desc'
  });
  
  // Pagination
  const [limit] = useState(24);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  // Load genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // 監聽 URL 參數變化和分頁
  useEffect(() => {
    const hasSearchParams = searchParams.toString().length > 0;
    if (hasSearchParams) {
      // 有搜尋參數,執行搜尋
      performSearch();
    } else {
      // 沒有搜尋參數,顯示全部
      fetchAnime();
    }
  }, [searchParams, offset]);

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

  // 執行搜尋的函數
  const performSearch = async () => {
    setLoading(true);
    try {
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
    setOffset(0);
    
    // 更新 URL 參數
    const params = new URLSearchParams();
    
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
    setOffset(0);
    setSearchParams({});  // 清除 URL 參數
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Remove individual filter from tags
  const handleRemoveFilter = (field) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (field === 'searchQuery') {
      newParams.delete('q');
      setSearchQuery('');
    } else if (field === 'sort') {
      // Reset sort to default
      newParams.set('sort_by', 'score');
      newParams.set('order', 'desc');
      setFilters(prev => ({
        ...prev,
        sort_by: 'score',
        order: 'desc'
      }));
    } else if (field === 'genres' || field === 'types' || field === 'years') {
      // Clear array filters
      newParams.delete(field);
      setFilters(prev => ({
        ...prev,
        [field]: []
      }));
    } else {
      // Clear single value filters
      newParams.delete(field);
      setFilters(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Reset to first page when removing filter
    setOffset(0);
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNum) => {
    const newOffset = (pageNum - 1) * limit;
    setOffset(newOffset);
    window.scrollTo(0, 0);
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filters.genres.length > 0 || filters.min_score || 
                          filters.max_score || filters.years.length > 0 || filters.types.length > 0;

  // 判斷是否在搜尋模式
  const isSearchMode = searchParams.toString().length > 0;

  // Prepare filters object for FilterTags component
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
      {/* Filter Tags Display - 只在有篩選條件時顯示 */}
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

      {/* Pagination Controls - 智能版 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 mb-8">
          {/* Previous Button */}
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

          {/* Page Selection - Dropdown or Input based on total pages */}
          <div className="flex items-center gap-2">
            {/* Show dropdown if pages <= 20 */}
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
                {/* Show input if pages > 20 */}
                <span className="text-gray-600">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  defaultValue={currentPage}
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      handlePageChange(value);
                    } else {
                      e.target.value = currentPage;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= totalPages) {
                        handlePageChange(value);
                        e.target.blur();
                      }
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

          {/* Next Button */}
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