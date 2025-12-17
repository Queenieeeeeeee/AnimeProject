// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestAnime } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home() {
  const [featuredAnime, setFeaturedAnime] = useState([]);
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

  return (
    <div>
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
                type: 'fraction',
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

            {/* Navigation & Pagination Controls */}
            <div className="custom-swiper-controls">
              <button className="custom-swiper-button custom-swiper-prev">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="custom-swiper-pagination"></div>
              
              <button className="custom-swiper-button custom-swiper-next">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/discover" className="block p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-xl font-bold mb-2">Discover</h3>
          <p className="text-purple-100 text-sm">Find your next anime</p>
        </Link>

        <Link to="/browse" className="block p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="text-xl font-bold mb-2">Browse</h3>
          <p className="text-blue-100 text-sm">Explore all anime</p>
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