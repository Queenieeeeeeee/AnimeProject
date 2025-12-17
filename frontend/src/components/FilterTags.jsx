// src/components/FilterTags.jsx - 支援多選版本
import PropTypes from 'prop-types';

function FilterTags({ filters, onRemoveFilter, onClearAll, className = '' }) {
  const {
    searchQuery = '',
    genres = [],
    types = [],
    years = [],
    min_score = '',
    max_score = '',
    sort_by = 'score',
    order = 'desc'
  } = filters;

  // Check if any filters are active
  const hasActiveFilters = searchQuery || genres.length > 0 || min_score || 
                          max_score || years.length > 0 || types.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <span className="text-sm font-medium opacity-90">Active Filters:</span>
      
      {searchQuery && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>Search: &quot;{searchQuery}&quot;</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('searchQuery')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove search query"
          >
            ×
          </button>
        </span>
      )}
      
      {genres.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>
            Genres ({genres.length}): {
              genres.length > 3 
                ? `${genres.slice(0, 3).join(', ')}...` 
                : genres.join(', ')
            }
          </span>
          <button
            type="button"
            onClick={() => onRemoveFilter('genres')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove genre filters"
          >
            ×
          </button>
        </span>
      )}
      
      {types.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>Types ({types.length}): {types.join(', ')}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('types')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove type filters"
          >
            ×
          </button>
        </span>
      )}
      
      {years.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>
            Years ({years.length}): {
              years.length > 3 
                ? `${years.slice(0, 3).join(', ')}...` 
                : years.join(', ')
            }
          </span>
          <button
            type="button"
            onClick={() => onRemoveFilter('years')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove year filters"
          >
            ×
          </button>
        </span>
      )}
      
      {min_score && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>Min Score: {min_score}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('min_score')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove min score filter"
          >
            ×
          </button>
        </span>
      )}
      
      {max_score && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>Max Score: {max_score}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('max_score')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Remove max score filter"
          >
            ×
          </button>
        </span>
      )}

      {/* Show Sort/Order only if they're not default values */}
      {(sort_by !== 'score' || order !== 'desc') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm border border-white/30">
          <span>
            Sort: {sort_by === 'score' ? 'Score' : 
                   sort_by === 'members' ? 'Popularity' : 
                   sort_by === 'year' ? 'Year' : 'Title'}
            {' '}{order === 'desc' ? '↓' : '↑'}
          </span>
          <button
            type="button"
            onClick={() => onRemoveFilter('sort')}
            className="hover:text-red-300 font-bold text-base leading-none"
            title="Reset to default sort"
          >
            ×
          </button>
        </span>
      )}

      {/* Clear All Button */}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-2 px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full text-sm font-medium transition"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

FilterTags.propTypes = {
  filters: PropTypes.shape({
    searchQuery: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    types: PropTypes.arrayOf(PropTypes.string),
    years: PropTypes.arrayOf(PropTypes.string),
    min_score: PropTypes.string,
    max_score: PropTypes.string,
    sort_by: PropTypes.string,
    order: PropTypes.string,
  }).isRequired,
  onRemoveFilter: PropTypes.func.isRequired,
  onClearAll: PropTypes.func,
  className: PropTypes.string,
};

export default FilterTags;