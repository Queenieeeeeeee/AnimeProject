// src/components/RelatedWorks.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AnimeCard from './AnimeCard';

function RelatedWorks({ malId }) {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const relationTypeLabels = {
    'Sequel': 'Sequel',
    'Prequel': 'Prequel',
    'Side Story': 'Side Story',
    'Alternative Version': 'Alternative Version',
    'Summary': 'Summary',
    'Spin-off': 'Spin-off',
    'Adaptation': 'Adaptation',
    'Parent Story': 'Parent Story',
    'Alternative Setting': 'Alternative Setting',
    'Character': 'Character',
    'Other': 'Other',
  };

  useEffect(() => {
    if (malId) {
      fetchRelations();
    }
  }, [malId]);

  const fetchRelations = async () => {
    setLoading(true);
    setError(false);

    try {
      const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}/relations`);
      
      if (!jikanResponse.ok) {
        throw new Error('Failed to fetch relations');
      }

      const jikanData = await jikanResponse.json();
      const relationsData = jikanData.data || [];

      const processedRelations = await Promise.all(
        relationsData.map(async (relationGroup) => {
          const relationType = relationGroup.relation;
          const animeEntries = relationGroup.entry.filter(entry => entry.type === 'anime');

          const entriesWithDetails = await Promise.all(
            animeEntries.map(async (entry) => {
              try {
                const response = await fetch(`http://localhost:8000/api/anime/mal/${entry.mal_id}`);
                
                if (response.ok) {
                  const animeData = await response.json();
                  
                  if (animeData && animeData.id) {
                    return {
                      ...animeData,
                      inDatabase: true,
                    };
                  }
                }

                return {
                  id: null,
                  mal_id: entry.mal_id,
                  title: entry.name,
                  title_english: null,
                  image_url: null,
                  score: null,
                  year: null,
                  type: entry.type,
                  inDatabase: false,
                  malUrl: entry.url,
                };
              } catch (err) {
                console.error(`Error fetching anime ${entry.mal_id}:`, err);
                return {
                  id: null,
                  mal_id: entry.mal_id,
                  title: entry.name,
                  image_url: null,
                  inDatabase: false,
                  malUrl: entry.url,
                };
              }
            })
          );

          return {
            relationType,
            entries: entriesWithDetails,
          };
        })
      );

      const filteredRelations = processedRelations.filter(group => group.entries.length > 0);
      setRelations(filteredRelations);
    } catch (err) {
      console.error('Error fetching relations:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Related Works</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading related works...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Related Works</h2>
        <div className="text-center py-8 text-red-500">
          Failed to load related works. Please try again later.
        </div>
      </div>
    );
  }

  if (relations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">📖 Related Works</h2>

      {relations.map((relationGroup, index) => (
        <div key={index} className="mb-8 last:mb-0">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
            {relationTypeLabels[relationGroup.relationType] || relationGroup.relationType}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {relationGroup.entries.map((anime) => {
              if (anime.inDatabase) {
                return (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="compact"
                    showYear={false}
                    showEpisodes={false}
                  />
                );
              }

              return (
                <a
                  key={anime.mal_id}
                  href={anime.malUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">📺</div>
                        <p className="text-xs text-gray-500">Not in Database</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <h3 className="font-semibold text-xs line-clamp-2 mb-1" title={anime.title}>
                      {anime.title}
                    </h3>
                    <div className="text-xs text-blue-500 hover:text-blue-700">
                      View on MyAnimeList →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

RelatedWorks.propTypes = {
  malId: PropTypes.number.isRequired,
};

export default RelatedWorks;