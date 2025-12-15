// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestAnime, searchAnime } from '../services/api';
import AnimeCard from '../components/AnimeCard';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home() {
  const [featuredAnime, setFeaturedAnime] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAnime();
  }, []);

  const fetchFeaturedAnime = async () => {
    try {
      const response = await getLatestAnime(20);
      setFeaturedAnime(response.data.data);
    } catch (error) {
      console.error('Error fetching latest anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchAnime(searchQuery, 8);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-center mb-3">
          Discover Your Next Favorite Anime
        </h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anime..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Search Results</h2>
            <button 
              onClick={() => setSearchResults([])} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {searchResults.map(anime => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                variant="compact"
                showYear={false}
                showEpisodes={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Latest Anime Carousel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🔥 Latest Anime</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="custom-swiper-container">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={7}
              navigation={{
                nextEl: '.custom-swiper-next',
                prevEl: '.custom-swiper-prev',
              }}
              pagination={{ 
                el: '.custom-swiper-pagination',
                type:'fraction',
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets:3
              }}
              breakpoints={{
                320: { slidesPerView: 2, spaceBetween: 10 },
                640: { slidesPerView: 3, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 14 },
                1024: { slidesPerView: 5, spaceBetween: 16 },
                1280: { slidesPerView: 6, spaceBetween: 16 },
                1536: { slidesPerView: 7, spaceBetween: 16 }
              }}
            >
              {featuredAnime.map(anime => (
                <SwiperSlide key={anime.id}>
                  <AnimeCard
                    anime={anime}
                    variant="carousel"
                    showYear={true}
                    showEpisodes={false}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="custom-swiper-controls">
              <div className="custom-swiper-button custom-swiper-prev">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              
              <div className="custom-swiper-pagination"></div>
              
              <div className="custom-swiper-button custom-swiper-next">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/recommendations" className="block p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold mb-2">Recommendations</h3>
          <p className="text-purple-100 text-sm">Find similar anime</p>
        </Link>

        <Link to="/browse" className="block p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold mb-2">Browse</h3>
          <p className="text-purple-100 text-sm">Find all anime</p>
        </Link>

        <Link to="/analytics/overview" className="block p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-xl font-bold mb-2">Analytics</h3>
          <p className="text-green-100 text-sm">Market trends & insights</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;