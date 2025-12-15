// src/pages/AnimeDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnimeById } from '../services/api';
import RelatedWorks from '../components/RelatedWorks';

function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnimeDetail();
  }, [id]);

  const fetchAnimeDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnimeById(id);
      setAnime(response.data);
    } catch (error) {
      console.error('Error fetching anime detail:', error);
      setError('Failed to load anime details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error || 'Anime not found'}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/3 flex-shrink-0">
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-72 h-auto object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/225x350?text=No+Image';
              }}
            />
          </div>

          {/* Info Section */}
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
            {anime.title_english && anime.title_english !== anime.title && (
              <h2 className="text-xl text-gray-600 mb-4">{anime.title_english}</h2>
            )}

            {/* Rating and Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-xl font-bold text-blue-600">
                  ⭐ {anime.score || 'N/A'}
                </div>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-600">Rank</div>
                <div className="text-xl font-bold text-purple-600">
                  #{anime.rank || 'N/A'}
                </div>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-600">Popularity</div>
                <div className="text-xl font-bold text-green-600">
                  #{anime.popularity || 'N/A'}
                </div>
              </div>
              <div className="bg-orange-100 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-600">Members</div>
                <div className="text-xl font-bold text-orange-600">
                  {anime.members?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Type</div>
                <div className="font-semibold">{anime.type || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Episodes</div>
                <div className="font-semibold">{anime.episodes || 'Unknown'}</div>
              </div>
              {anime.year != null && (
                <div>
                  <div className="text-sm text-gray-600">Year</div>
                  <div className="font-semibold">{anime.year}</div>
                </div>
              )}
              {anime.season != null && anime.season !== '' && (
                <div>
                  <div className="text-sm text-gray-600">Season</div>
                  <div className="font-semibold capitalize">{anime.season}</div>
                </div>
              )}
              {anime.demographic != null && anime.demographic !== '' && (
                <div>
                  <div className="text-sm text-gray-600">Demographic</div>
                  <div className="font-semibold">{anime.demographic}</div>
                </div>
              )}
              {anime.favorites != null && anime.favorites > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Favorites</div>
                  <div className="font-semibold">{anime.favorites.toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Synopsis</h3>
                <p className="text-gray-700 leading-relaxed">{anime.synopsis}</p>
              </div>
            )}

            {/* Aired Dates */}
            {(anime.aired_from || anime.aired_to) && (
              <div className="pt-6 border-t">
                <div className="text-sm text-gray-600 mb-2">Aired</div>
                <div className="text-gray-700">
                  {anime.aired_from && new Date(anime.aired_from).toLocaleDateString()} 
                  {anime.aired_to && ` to ${new Date(anime.aired_to).toLocaleDateString()}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Genres - Moved outside to full width */}
        <div className="px-6 pb-6">
          {anime.genres && anime.genres.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Genres</div>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Studios - Moved outside to full width */}
          {anime.studios && anime.studios.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Studios</div>
              <div className="flex flex-wrap gap-2">
                {anime.studios.map(studio => (
                  <span
                    key={studio.id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {studio.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Works - NEW! */}
      {anime.mal_id && <RelatedWorks malId={anime.mal_id} />}
    </div>
  );
}

export default AnimeDetail;