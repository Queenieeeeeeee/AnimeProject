// src/pages/Studios.jsx
import { useState, useEffect } from 'react';
import { getStudios } from '../services/api';
import { Link } from 'react-router-dom';

function Studios() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [years, setYears] = useState(5);
  const [sortBy, setSortBy] = useState('workload');
  const [summary, setSummary] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    fetchStudios();
  }, [years, sortBy]);

  const fetchStudios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudios(years, sortBy, 10);
      setStudios(response.data.data.studios);
      setSummary(response.data.data.summary);
      setTimeRange(response.data.data.time_range);
    } catch (error) {
      console.error('Error fetching studios:', error);
      setError('Failed to load studios data. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading studios data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Studios Analysis</h1>
      
      {/* Summary */}
      {summary && timeRange && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">📊 Summary ({timeRange.start_year} - {timeRange.end_year})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Avg Anime/Studio</p>
              <p className="text-xl font-bold">{summary.avg_anime_per_studio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top by Workload</p>
              <p className="text-lg font-semibold">{summary.top_studio_by_workload}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top by Count</p>
              <p className="text-lg font-semibold">{summary.top_studio_by_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top by Score</p>
              <p className="text-lg font-semibold">{summary.top_studio_by_score}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-1">Time Range</label>
          <select 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={1}>Last 1 year</option>
            <option value={3}>Last 3 years</option>
            <option value={5}>Last 5 years</option>
            <option value={10}>Last 10 years</option>
            <option value={20}>Last 20 years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="workload">Workload Score</option>
            <option value="count">Anime Count</option>
            <option value="score">Average Score</option>
            <option value="members">Popularity</option>
          </select>
        </div>
      </div>

      {/* Studios List */}
      <div className="grid gap-6">
        {studios.map((studio, index) => (
          <div key={studio.id} className="bg-white p-6 rounded-lg shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  #{index + 1} {studio.name}
                </h2>
                <p className="text-gray-600">
                  {studio.anime_count_recent} anime in last {years} years
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {studio.workload_score}
                </div>
                <div className="text-sm text-gray-600">Workload Score</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm text-gray-600">Total Anime</p>
                <p className="text-lg font-semibold">{studio.anime_count_total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg/Year</p>
                <p className="text-lg font-semibold">{studio.avg_anime_per_year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-lg font-semibold">⭐ {studio.average_score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-lg font-semibold">
                  {studio.popularity_metrics.total_members.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Type Distribution:</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(studio.type_distribution).map(([type, count]) => (
                  <span 
                    key={type} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>

            {/* Yearly Output */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Yearly Output:</h3>
              <div className="space-y-1">
                {studio.yearly_output.map(({ year, count }) => (
                  <div key={year} className="flex items-center gap-2">
                    <span className="w-12 text-sm text-gray-600">{year}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full"
                        style={{ width: `${(count / studio.avg_anime_per_year) * 50}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anime List (Collapsible) */}
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold hover:text-blue-600 transition">
                📺 View All Anime ({studio.anime_list.length})
              </summary>
              <div className="mt-4 grid gap-3 max-h-96 overflow-y-auto">
                {studio.anime_list.map(anime => (
                  <Link 
                    key={anime.id}
                    to={`/anime/${anime.id}`} 
                    className="flex gap-4 p-3 border rounded hover:bg-gray-50 transition"
                  >
                    <img 
                      src={anime.image_url} 
                      alt={anime.title}
                      className="w-16 h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x96?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{anime.title}</h4>
                      {anime.title_english && anime.title_english !== anime.title && (
                        <p className="text-sm text-gray-500">{anime.title_english}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-sm">
                        <span className="text-gray-600">
                          {anime.year} {anime.season && `• ${anime.season}`}
                        </span>
                        <span className="text-gray-600">{anime.type}</span>
                        {anime.episodes && (
                          <span className="text-gray-600">{anime.episodes} eps</span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        {anime.score && (
                          <span>⭐ {anime.score}</span>
                        )}
                        {anime.members && (
                          <span>👥 {anime.members.toLocaleString()}</span>
                        )}
                        {anime.favorites && (
                          <span>❤️ {anime.favorites.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Studios;