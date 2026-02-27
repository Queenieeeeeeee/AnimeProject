// src/pages/Discover.jsx - Responsive Version
import { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import {
  getClassicsAnime,
  getRecentHitsAnime,
  getHiddenGems,
  getAnimeByStudio,
  getStudiosList
} from '../services/api';

function Discover() {
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeSubCategory, setActiveSubCategory] = useState('classics');
  const [selectedStudio, setSelectedStudio] = useState(null);
  
  const [recommendations, setRecommendations] = useState([]);
  const [studiosList, setStudiosList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const categories = [
    {
      id: 'popular',
      name: 'Popular',
      icon: '🔥',
      description: 'Most beloved anime across all eras',
      type: 'multi',
      subcategories: [
        { id: 'classics', name: 'All-Time Classics', description: 'Timeless masterpieces (5+ years old, highly rated)' },
        { id: 'recent-hits', name: 'Recent Hits', description: 'Popular anime from the last 3 years' }
      ]
    },
    {
      id: 'hidden-gems',
      name: 'Hidden Gems',
      icon: '💎',
      description: 'Underrated quality anime with loyal fanbases',
      type: 'single'
    },
    {
      id: 'studios',
      name: 'Studios',
      icon: '🏢',
      description: 'Explore anime by production studio',
      type: 'dropdown'
    }
  ];

  useEffect(() => {
    if (activeCategory === 'studios' && studiosList.length === 0) {
      fetchStudiosList();
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchRecommendations();
  }, [activeCategory, activeSubCategory, selectedStudio, currentPage]);

  const fetchStudiosList = async () => {
    try {
      const response = await getStudiosList();
      const data = response.data;
      if (data.success) {
        setStudiosList(data.data);
        if (data.data.length > 0 && !selectedStudio) {
          setSelectedStudio(data.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let response;

      if (activeCategory === 'popular') {
        if (activeSubCategory === 'classics') {
          response = await getClassicsAnime(itemsPerPage, offset);
        } else if (activeSubCategory === 'recent-hits') {
          response = await getRecentHitsAnime(itemsPerPage, offset);
        }
      } else if (activeCategory === 'hidden-gems') {
        response = await getHiddenGems(itemsPerPage, offset);
      } else if (activeCategory === 'studios' && selectedStudio) {
        response = await getAnimeByStudio(selectedStudio, itemsPerPage, offset);
      }

      if (response && response.data.success) {
        setRecommendations(response.data.data);
        setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
    setCurrentPage(1);
    setError(null);

    const category = categories.find(c => c.id === categoryId);
    if (category && category.type === 'multi') {
      setActiveSubCategory(category.subcategories[0].id);
    }
  };

  const handleSubCategoryChange = (subCategoryId) => {
    setActiveSubCategory(subCategoryId);
    setCurrentPage(1);
    setError(null);
  };

  const handleStudioChange = (e) => {
    setSelectedStudio(e.target.value);
    setCurrentPage(1);
    setError(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentCategoryInfo = () => {
    const mainCat = categories.find(c => c.id === activeCategory);
    if (!mainCat) return { name: '', description: '' };

    if (mainCat.type === 'multi') {
      const subCat = mainCat.subcategories.find(s => s.id === activeSubCategory);
      return { name: `${mainCat.name} - ${subCat?.name || ''}`, description: subCat?.description || mainCat.description };
    } else if (mainCat.type === 'dropdown' && selectedStudio) {
      return { name: selectedStudio, description: `Anime produced by ${selectedStudio}` };
    }

    return { name: mainCat.name, description: mainCat.description };
  };

  const currentInfo = getCurrentCategoryInfo();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">Discover Anime</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Curated collections to help you find your next favorite anime
        </p>
      </div>

      {/* Main Category Tabs */}
      <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
        {/* Mobile: stacked layout; Desktop: flex row */}
        <div className="flex flex-col sm:flex-row overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`
                flex items-center gap-3 px-4 py-3 sm:py-4 text-left sm:text-center transition
                border-b sm:border-b-0 sm:border-r last:border-b-0 sm:last:border-r-0
                sm:flex-1 sm:flex-col sm:items-center
                ${activeCategory === category.id
                  ? 'bg-purple-50 text-purple-600 border-l-4 border-l-purple-600 sm:border-l-0 sm:border-b-2 sm:border-b-purple-600'
                  : 'border-gray-100 text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-2xl flex-shrink-0">{category.icon}</span>
              <div>
                <div className="font-semibold text-sm md:text-base">{category.name}</div>
                <div className="text-xs opacity-75 hidden sm:block">{category.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-category Tabs (for Popular category) */}
      {categories.find(c => c.id === activeCategory)?.type === 'multi' && (
        <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row">
            {categories
              .find(c => c.id === activeCategory)
              ?.subcategories.map(subcat => (
                <button
                  key={subcat.id}
                  onClick={() => handleSubCategoryChange(subcat.id)}
                  className={`
                    flex-1 px-4 py-3 text-left sm:text-center transition
                    border-b sm:border-b-0 last:border-0
                    ${activeSubCategory === subcat.id
                      ? 'border-l-4 border-l-purple-600 sm:border-l-0 sm:border-b-2 sm:border-b-purple-600 text-purple-600 bg-purple-50'
                      : 'border-gray-100 text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-medium text-sm md:text-base">{subcat.name}</div>
                  <div className="text-xs text-gray-500 sm:hidden">{subcat.description}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Studio Dropdown */}
      {activeCategory === 'studios' && studiosList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Studio:
          </label>
          <select
            value={selectedStudio || ''}
            onChange={handleStudioChange}
            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {studiosList.map(studio => (
              <option key={studio.id} value={studio.name}>
                {studio.name} ({studio.anime_count} anime)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && recommendations.length > 0 && (
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">
              {currentInfo.name}
              <span className="text-gray-500 font-normal ml-2 text-sm md:text-base">
                ({totalItems} total)
              </span>
            </h2>
          </div>

          {/* Anime Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {recommendations.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mt-8 mb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto
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
                        <option key={pageNum} value={pageNum}>{pageNum}</option>
                      ))}
                    </select>
                    <span className="text-gray-600">of <span className="font-semibold">{totalPages}</span></span>
                  </>
                ) : (
                  <>
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
                    <span className="text-gray-600">of <span className="font-semibold">{totalPages}</span></span>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto
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
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No recommendations found</h3>
          <p className="text-gray-500">Try selecting a different category or option</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📊 About {currentInfo.name}
        </h3>

        <div className="text-blue-800 space-y-2 text-sm md:text-base">
          {activeSubCategory === 'classics' && (
            <>
              <p>Timeless classics that have stood the test of time, featuring anime from 5+ years ago with exceptional ratings and large, dedicated fanbases.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Released 5+ years ago</li>
                <li>Minimum score: 7.5</li>
                <li>At least 100,000 members</li>
                <li>Sorted by score (highest first)</li>
              </ul>
            </>
          )}
          {activeSubCategory === 'recent-hits' && (
            <>
              <p>Popular anime from the last 3 years that have captured audiences with high quality and strong engagement.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Released in the last 3 years</li>
                <li>Minimum score: 7.0</li>
                <li>At least 50,000 members</li>
                <li>Sorted by score (highest first)</li>
              </ul>
            </>
          )}
          {activeCategory === 'hidden-gems' && (
            <>
              <p>Underrated masterpieces with exceptional quality but limited mainstream recognition.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Score: 8.0+ (exceptional quality)</li>
                <li>Popularity rank: 5000+ (truly underrated)</li>
                <li>At least 10,000 members (proven quality)</li>
                <li>Sorted by score (highest first)</li>
              </ul>
            </>
          )}
          {activeCategory === 'studios' && (
            <>
              <p>Explore anime produced by {selectedStudio}, showcasing their creative work and distinctive style.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Minimum score: 6.0</li>
                <li>Sorted by score and popularity</li>
                <li>Only studios with 5+ anime shown</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Discover;