// src/components/RelatedWorks.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AnimeCard from './AnimeCard';
import { API_BASE_URL } from '../services/api';

// Utility function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      // Fetch relations from Jikan API
      const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}/relations`);
      
      if (!jikanResponse.ok) {
        throw new Error('Failed to fetch relations');
      }

      const jikanData = await jikanResponse.json();
      const relationsData = jikanData.data || [];

      // Process each relation group
      const processedRelations = await Promise.all(
        relationsData.map(async (relationGroup) => {
          const relationType = relationGroup.relation;
          const animeEntries = relationGroup.entry.filter(entry => entry.type === 'anime');

          // ✅ FIXED: Fetch details sequentially with delay to avoid rate limiting
          const entriesInDatabase = [];
          
          for (const entry of animeEntries) {
            try {
              const response = await fetch(`${API_BASE_URL}/api/anime/mal/${entry.mal_id}`);
              
              if (response.ok) {
                const animeData = await response.json();
                
                // Only add if anime exists in our database
                if (animeData && animeData.id) {
                  entriesInDatabase.push(animeData);
                }
              }
              
              // Add small delay between requests to avoid rate limiting
              // Only delay if there are more entries to fetch
              if (animeEntries.indexOf(entry) < animeEntries.length - 1) {
                await delay(100); // 100ms delay between requests
              }
            } catch (err) {
              console.error(`Error fetching anime ${entry.mal_id}:`, err);
              // Continue to next entry on error
            }
          }

          return {
            relationType,
            entries: entriesInDatabase,
          };
        })
      );

      // Only keep relation groups that have at least one anime in our database
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
        <h2 className="text-2xl font-bold mb-4">📖 Related Works</h2>
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
        <h2 className="text-2xl font-bold mb-4">📖 Related Works</h2>
        <div className="text-center py-8 text-red-500">
          Failed to load related works. Please try again later.
        </div>
      </div>
    );
  }

  // Don't show the section if there are no related works in our database
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
            {relationGroup.entries.map((anime) => (
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
      ))}
    </div>
  );
}

RelatedWorks.propTypes = {
  malId: PropTypes.number.isRequired,
};

export default RelatedWorks;