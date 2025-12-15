// src/pages/Recommendations.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';

function Discover() {
  const navigate = useNavigate();
  
  // State
  const [activeMainCategory, setActiveMainCategory] = useState('popular');
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [studiosList, setStudiosList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Main categories configuration
  const mainCategories = [
    {
      id: 'popular',
      name: 'Popular',
      icon: '🔥',
      description: 'Most popular anime',
      type: 'single',
      endpoint: '/api/recommendations/popular'
    },
    {
      id: 'quality',
      name: 'Quality',
      icon: '⭐',
      description: 'Highest rated anime',
      type: 'multi',
      subcategories: [
        {
          id: 'top-rated',
          name: 'Top Rated',
          endpoint: '/api/recommendations/top-rated',
          description: 'Highest scored anime (8.0+)'
        },
        {
          id: 'hidden-gems',
          name: 'Hidden Gems',
          endpoint: '/api/recommendations/hidden-gems',
          description: 'Underrated quality anime'
        }
      ]
    },
    {
      id: 'recency',
      name: 'Recent',
      icon: '🆕',
      description: 'Latest releases',
      type: 'multi',
      subcategories: [
        {
          id: 'latest',
          name: 'Latest',
          endpoint: '/api/recommendations/latest',
          description: 'Recent releases'
        },
        {
          id: 'trending',
          name: 'Trending',
          endpoint: '/api/recommendations/trending',
          description: 'Currently trending'
        }
      ]
    },
    {
      id: 'genre',
      name: 'Genre',
      icon: '🎭',
      description: 'Browse by genre',
      type: 'dropdown'
    },
    {
      id: 'studio',
      name: 'Studio',
      icon: '🏢',
      description: 'Browse by studio',
      type: 'dropdown'
    }
  ];

  // Fetch genres list on mount
  useEffect(() => {
    if (activeMainCategory === 'genre') {
      fetchGenresList();
    }
  }, [activeMainCategory]);

  // Fetch studios list on mount
  useEffect(() => {
    if (activeMainCategory === 'studio') {
      fetchStudiosList();
    }
  }, [activeMainCategory]);

  // Fetch recommendations when category/subcategory changes
  useEffect(() => {
    fetchRecommendations();
  }, [activeMainCategory, activeSubCategory, selectedGenre, selectedStudio]);

  const fetchGenresList = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/recommendations/genres/list');
      const data = await response.json();
      if (data.success) {
        setGenresList(data.data);
        // Set first genre as default
        if (data.data.length > 0 && !selectedGenre) {
          setSelectedGenre(data.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchStudiosList = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/recommendations/studios/list');
      const data = await response.json();
      if (data.success) {
        setStudiosList(data.data);
        // Set first studio as default
        if (data.data.length > 0 && !selectedStudio) {
          setSelectedStudio(data.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    }
  };

  const fetchRecommendations = async () => {
    const category = mainCategories.find(c => c.id === activeMainCategory);
    if (!category) return;

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '';

      // Determine endpoint based on category type
      if (category.type === 'single') {
        endpoint = category.endpoint;
      } else if (category.type === 'multi') {
        const subcat = category.subcategories.find(s => s.id === activeSubCategory);
        if (subcat) {
          endpoint = subcat.endpoint;
        } else {
          // Default to first subcategory
          endpoint = category.subcategories[0].endpoint;
          setActiveSubCategory(category.subcategories[0].id);
        }
      } else if (category.type === 'dropdown') {
        if (category.id === 'genre' && selectedGenre) {
          endpoint = `/api/recommendations/genre/${encodeURIComponent(selectedGenre)}`;
        } else if (category.id === 'studio' && selectedStudio) {
          endpoint = `/api/recommendations/studio/${encodeURIComponent(selectedStudio)}`;
        } else {
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(`http://localhost:8000${endpoint}?limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainCategoryChange = (categoryId) => {
    setActiveMainCategory(categoryId);
    setActiveSubCategory(null);
    setError(null);

    const category = mainCategories.find(c => c.id === categoryId);
    
    // If multi-category, set first subcategory as default
    if (category && category.type === 'multi') {
      setActiveSubCategory(category.subcategories[0].id);
    }
  };

  const handleSubCategoryChange = (subCategoryId) => {
    setActiveSubCategory(subCategoryId);
    setError(null);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setError(null);
  };

  const handleStudioChange = (e) => {
    setSelectedStudio(e.target.value);
    setError(null);
  };

  // Get current category info for display
  const getCurrentCategory = () => {
    const mainCat = mainCategories.find(c => c.id === activeMainCategory);
    if (!mainCat) return { name: '', description: '' };

    if (mainCat.type === 'multi') {
      const subCat = mainCat.subcategories.find(s => s.id === activeSubCategory);
      return {
        name: `${mainCat.name} - ${subCat?.name || ''}`,
        description: subCat?.description || mainCat.description
      };
    } else if (mainCat.type === 'dropdown') {
      if (mainCat.id === 'genre' && selectedGenre) {
        return {
          name: `${selectedGenre} Anime`,
          description: `Anime in ${selectedGenre} genre`
        };
      } else if (mainCat.id === 'studio' && selectedStudio) {
        return {
          name: `${selectedStudio}`,
          description: `Anime by ${selectedStudio}`
        };
      }
    }

    return {
      name: mainCat.name,
      description: mainCat.description
    };
  };

  const currentCategory = getCurrentCategory();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Discover Anime</h1>
        <p className="text-gray-600">
          Explore curated recommendations across different categories
        </p>
      </div>

      {/* Main Category Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex overflow-x-auto">
          {mainCategories.map(category => (
            <button
              key={category.id}
              onClick={() => handleMainCategoryChange(category.id)}
              className={`
                flex-1 min-w-fit px-6 py-4 text-center border-b-2 transition
                ${activeMainCategory === category.id
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{category.name}</div>
                  <div className="text-xs opacity-75">{category.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-category Tabs (for multi-type categories) */}
      {mainCategories.find(c => c.id === activeMainCategory)?.type === 'multi' && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex">
            {mainCategories
              .find(c => c.id === activeMainCategory)
              ?.subcategories.map(subcat => (
                <button
                  key={subcat.id}
                  onClick={() => handleSubCategoryChange(subcat.id)}
                  className={`
                    flex-1 px-6 py-3 text-center border-b-2 transition
                    ${activeSubCategory === subcat.id
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-medium">{subcat.name}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Genre Dropdown */}
      {activeMainCategory === 'genre' && genresList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Genre:
          </label>
          <select
            value={selectedGenre || ''}
            onChange={handleGenreChange}
            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {genresList.map(genre => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Studio Dropdown */}
      {activeMainCategory === 'studio' && studiosList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
            <h2 className="text-xl font-semibold">
              {currentCategory.name}
              <span className="text-gray-500 font-normal ml-2">
                ({recommendations.length} anime)
              </span>
            </h2>
          </div>

          {/* Anime Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No recommendations found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or option
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📊 About {currentCategory.name}
        </h3>
        
        <div className="text-blue-800 space-y-2">
          {activeMainCategory === 'popular' && (
            <>
              <p>
                These anime have the largest communities on MyAnimeList, 
                indicating proven popularity and strong fanbase engagement.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Sorted by total member count</li>
                <li>Quality filtered (minimum score: 6.0)</li>
                <li>Safe recommendations for general audience</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'quality' && activeSubCategory === 'top-rated' && (
            <>
              <p>
                Highest rated anime with proven quality and large viewer base.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Minimum score: 8.0</li>
                <li>At least 50,000 members</li>
                <li>Sorted by score (highest first)</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'quality' && activeSubCategory === 'hidden-gems' && (
            <>
              <p>
                Underrated quality anime with loyal fanbases.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Score: 7.5+ (high quality)</li>
                <li>Members: 10K-100K (underrated)</li>
                <li>High favorites/members ratio</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'recency' && activeSubCategory === 'latest' && (
            <>
              <p>
                Most recent anime releases from current and previous year.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>From 2024-2025</li>
                <li>Minimum score: 6.5</li>
                <li>Sorted by year and popularity</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'recency' && activeSubCategory === 'trending' && (
            <>
              <p>
                Currently trending anime with high engagement.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Recent releases (2024-2025)</li>
                <li>High member count (50K+)</li>
                <li>Quality score (7.0+)</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'genre' && (
            <>
              <p>
                Anime in the {selectedGenre} genre, sorted by score and popularity.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Minimum score: 6.5</li>
                <li>Sorted by score and member count</li>
              </ul>
            </>
          )}

          {activeMainCategory === 'studio' && (
            <>
              <p>
                Anime produced by {selectedStudio}, showcasing their creative work.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Minimum score: 6.0</li>
                <li>Sorted by score and popularity</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Discover;