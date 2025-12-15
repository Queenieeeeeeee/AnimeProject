// src/components/AnimeCard.jsx
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function AnimeCard({ anime, variant = 'grid', showYear = false, showEpisodes = false }) {
  // Fallback for missing data
  const title = anime.title || anime.title_english || 'Unknown Title';
  const imageUrl = anime.image_url || 'https://via.placeholder.com/225x318?text=No+Image';
  const score = anime.score || 'N/A';
  const year = anime.year || 'Unknown';
  const type = anime.type || '';
  const episodes = anime.episodes;

  // Variant styles
  const variants = {
    grid: {
      container: 'bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer',
      image: 'w-48 h-72 object-cover',
      content: 'p-3',
      title: 'font-semibold text-sm line-clamp-2 mb-2',
    },
    carousel: {
      container: 'block bg-white rounded-lg shadow hover:shadow-xl transition group cursor-pointer h-full',
      image: 'w-full h-34 object-cover group-hover:scale-105 transition',
      content: 'p-3 flex flex-col flex-grow',
      title: 'font-semibold text-sm line-clamp-2 min-h-[2.5rem] mb-2',
    },
    compact: {
      container: 'bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer',
      image: 'w-full h-48 object-cover',
      content: 'p-2',
      title: 'font-semibold text-xs line-clamp-2 mb-1',
    },
  };

  const style = variants[variant] || variants.grid;

  return (
    <Link to={`/anime/${anime.id}`} className={style.container}>
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className={style.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/225x318?text=No+Image';
          }}
        />
        
        {/* Year Badge (only if showYear is true) */}
        {showYear && year !== 'Unknown' && (
          <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-semibold">
            {year}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={style.content}>
        <h3 className={style.title} title={title}>
          {title}
        </h3>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            ⭐ {score}
          </span>
          {type && <span className="text-xs">{type}</span>}
        </div>

        {/* Additional Info */}
        {(variant === 'grid' || showEpisodes) && (
          <div className="text-xs text-gray-500 mt-1">
            {!showYear && year !== 'Unknown' && year}
            {episodes && ` • ${episodes} eps`}
          </div>
        )}
      </div>
    </Link>
  );
}

AnimeCard.propTypes = {
  anime: PropTypes.shape({
    id: PropTypes.number.isRequired,
    mal_id: PropTypes.number,
    title: PropTypes.string,
    title_english: PropTypes.string,
    image_url: PropTypes.string,
    score: PropTypes.number,
    year: PropTypes.number,
    type: PropTypes.string,
    episodes: PropTypes.number,
  }).isRequired,
  variant: PropTypes.oneOf(['grid', 'carousel', 'compact']),
  showYear: PropTypes.bool,
  showEpisodes: PropTypes.bool,
};

export default AnimeCard;